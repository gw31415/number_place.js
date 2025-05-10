#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use number_place::*;
use wasm_bindgen::prelude::*;

macro_rules! place {
    ($i: expr) => {
        Place::new_from_raw($i).ok_or(JsError::new("プレースのインデックスが範囲外です"))?
    }
}

macro_rules! value {
    ($value: expr) => {
        Value::new($value).ok_or(JsError::new("バリューが範囲外です"))?
    };
}

#[wasm_bindgen]
/// この構造体にナンプレの数字を書き込んでいきます。
pub struct Field(EntropyField);

#[wasm_bindgen]
impl Field {
    #[wasm_bindgen(constructor)]
    pub fn new(bytes: Option<Box<[u8]>>) -> Result<Field, JsError> {
        match bytes {
            None => Ok(Field(Default::default())),
            Some(bytes) => {
                let bytes: Box<[u8; entropy_field::BITS_LENGTH]> = bytes
                    .try_into()
                    .or(Err(JsError::new("Failed to reproduce Field.")))?;
                Ok(Field(
                    entropy_field::EntropyField::try_from(*bytes)
                        .or(Err(JsError::new("Failed to reproduce Field.")))?,
                ))
            }
        }
    }
    #[wasm_bindgen]
    pub fn bytes(&self) -> Box<[u8]> {
        let bytes: [u8; entropy_field::BITS_LENGTH] = self.0.clone().into();
        bytes.into()
    }
    #[wasm_bindgen]
    /// ナンプレに数字を記入します。
    pub fn insert(&mut self, i: usize, value: u32) -> Result<(), JsError> {
        let place = place!(i);
        let value = value!(value);
        self.0
            .insert(place, value)
            .map_err(|e| JsError::new(&e.to_string()))
    }
    #[wasm_bindgen]
    /// 指定した位置に入る可能性のある値一覧を返します。
    pub fn possiblity_at(&self, i: usize) -> Result<Vec<u32>, JsError> {
        let mut list = Vec::new();
        let entropy = self.0.entropy_at(&place!(i)).to_owned();
        for value in entropy {
            list.push(value.into())
        }
        Ok(list)
    }
}

#[wasm_bindgen]
/// ナンプレの解答を探索する構造体です。
pub struct Seeker(Attacker);

#[wasm_bindgen]
impl Seeker {
    #[wasm_bindgen(constructor)]
    pub fn new(field: &Field) -> Seeker {
        Seeker(field.0.clone().into())
    }
    #[wasm_bindgen]
    /// 探索を1ステップ進め、Reportを返します。
    pub fn next(&mut self) -> Report {
        Report(self.0.next())
    }
}

#[wasm_bindgen]
/// Seekerの探索の現在の進捗を表す構造体です。
pub struct Report(Option<brute_force::Report>);
#[wasm_bindgen]
impl Report {
    #[wasm_bindgen(getter)]
    /// 進捗メッセージを文字列で表します。
    pub fn msg(&self) -> String {
        use brute_force::Report::*;
        match &self.0 {
            Some(report) => match report {
                Found(_) => "FOUND: An answer found.".to_string(),
                Try {
                    value,
                    place,
                    result,
                } => format!(
                    "ASSUMPTION: {value}@{place} -> {}",
                    if result.is_err() {
                        "fail."
                    } else {
                        "continue."
                    }
                ),
            },
            None => "FINISHED.".to_string(),
        }
    }
    #[wasm_bindgen(getter)]
    /// 進捗をEnumで返します。
    pub fn state(&self) -> SeekerState {
        use brute_force::Report::*;
        match &self.0 {
            Some(Found(_)) => SeekerState::Found,
            Some(Try { result: Ok(_), .. }) => SeekerState::TryContinue,
            Some(Try { result: Err(_), .. }) => SeekerState::TryFail,
            None => SeekerState::Finished,
        }
    }
    #[wasm_bindgen(getter)]
    /// 解答が見つかった場合、解答を返します。
    /// 解答途中のフィールドを返せる場合、それを返します。
    pub fn field(&self) -> Option<Field> {
        if let Some(report) = &self.0 {
            if let brute_force::Report::Found(field) = report {
                return Some(Field(field.to_owned()));
            } else if let brute_force::Report::Try {
                result: Ok(field), ..
            } = report
            {
                return Some(Field(field.to_owned()));
            }
        }
        None
    }
}

#[wasm_bindgen]
/// Seekerによる探索の現在の状態を表します。
pub enum SeekerState {
    /// Seekerによる探索が終了したことを示します。
    Finished,
    /// 1つの仮定が失敗したことを示します。
    TryFail,
    /// 1つの仮定が失敗しなかったことを示します。
    TryContinue,
    /// 1つの解答が発見されたことを示します。
    Found,
}
