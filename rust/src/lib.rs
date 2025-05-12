#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use brute_force::Report;
use js_sys::Uint8Array;
use number_place::*;
use wasm_bindgen::prelude::*;

type Result<T> = std::result::Result<T, JsError>;

/// EntropyFieldを相互変換するための構造体
struct EntropyFieldConverter(EntropyField);
impl TryFrom<Uint8Array> for EntropyFieldConverter {
    type Error = JsError;
    fn try_from(array: Uint8Array) -> Result<Self> {
        if array.length() != entropy_field::BITS_LENGTH as u32 {
            return Err(JsError::new("Invalid length. Expected 324 bits."));
        }

        let mut bytes = [0u8; entropy_field::BITS_LENGTH];
        array.copy_to(&mut bytes);

        let Ok(field) = EntropyField::try_from(bytes) else {
            return Err(JsError::new(
                "Failed to convert Uint8Array to EntropyField.",
            ));
        };
        Ok(EntropyFieldConverter(field))
    }
}
impl From<EntropyFieldConverter> for Uint8Array {
    fn from(val: EntropyFieldConverter) -> Self {
        let bytes: [u8; entropy_field::BITS_LENGTH] = val.0.into();
        Uint8Array::from(bytes.as_slice())
    }
}

#[wasm_bindgen]
/// 空のEntropyFieldを生成する
pub fn new_empty_field() -> Uint8Array {
    EntropyFieldConverter(const { EntropyField::new() }).into()
}

#[wasm_bindgen]
/// EntropyFieldに1つの数字を挿入した結果を返す
///
/// # Arguments
///
/// * `field` - Uint8Arrayで表現されたEntropyField
/// * `position` - 書き込む位置 (0-80)
/// * `value` - 書き込む数字 (1-9)
pub fn next_field(field: Uint8Array, position: usize, value: u32) -> Result<Uint8Array> {
    let position = Place::new_from_raw(position).ok_or(JsError::new(
        "位置が範囲外です。0-80の整数で指定してください",
    ))?;
    let value = Value::new(value).ok_or(JsError::new(
        "数値が範囲外です。1-9の整数で指定してください",
    ))?;
    let EntropyFieldConverter(mut field) = field.try_into()?;
    field
        .insert(position, value)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(EntropyFieldConverter(field).into())
}

#[wasm_bindgen]
/// 解を総当たりで探索する
///
/// # Arguments
///
/// * `field` - Uint8Arrayで表現されたEntropyField
pub fn brute_force(field: Uint8Array) -> Result<Uint8Array> {
    let EntropyFieldConverter(field) = field.try_into()?;
    let mut attacker = Attacker::new(field);
    loop {
        return match attacker.next() {
            Some(Report::Try { .. }) => {
                continue;
            }
            None => Err(JsError::new("解が見つかりませんでした")),
            Some(Report::Found(field)) => Ok(EntropyFieldConverter(field).into()),
        };
    }
}

#[derive(tsify::Tsify, serde::Serialize, serde::Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
/// EntropyFieldの各マスの情報を保持する構造体
pub struct Entropy {
    /// そのマスの可能性が何通りあるか
    length: u32,
    /// Entropyの内部表現
    entropy: u32,
}

#[derive(tsify::Tsify, serde::Serialize)]
#[tsify(into_wasm_abi)]
#[serde(transparent)]
pub struct DeserializedField(Vec<Entropy>);

#[wasm_bindgen]
/// EntropyFieldを解釈可能な形式に変換する
///
/// # Arguments
///
/// * `field` - Uint8Arrayで表現されたEntropyField
pub fn deserialize_field(field: Uint8Array) -> Result<DeserializedField> {
    let EntropyFieldConverter(field) = field.try_into()?;
    let mut result = Vec::new();
    for i in 0..81 {
        let place = &unsafe { Place::new_from_raw_unchecked(i) };
        let entropy = field.entropy_at(place).to_owned();
        result.push(Entropy {
            length: entropy.len(),
            entropy: entropy.into(),
        });
    }
    Ok(DeserializedField(result))
}

#[wasm_bindgen]
/// Entropyを入りうる値のリストに変換する
///
/// # Arguments
///
/// * `entropy` - Entropy
pub fn deserialize_entropy(entropy: Entropy) -> Result<Vec<u32>> {
    let Ok(entropy) = number_place::Entropy::try_from(entropy.entropy) else {
        return Err(JsError::new("Entropyの変換に失敗しました"));
    };
    Ok(entropy.into_iter().map(Into::<u32>::into).collect())
}
