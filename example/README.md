# Suhjong-wasm Example

実際のウェブサイト：[Suhjong Highest Scores](https://gw31415.github.io/suhjong-wasm/)

入力された手札からハイスコアを計算するウェブサイトとなっています。
[Hugo](https://gohugo.io)を用いて開発しています。

## ディレクトリ構成

```
.
├── README.md
├── assets
│   ├── script.js
│   └── style.scss
├── config.toml
├── layouts
│   └── index.html
├── required_chars.py
└── static
    ├── favicon.png
    └── pkg/
```

| ファイル              | 内容                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `assets/script.js`    | スクリプトの本体。`static/pkg` を読みこんでいる。                                                |
| `assets/style.scss`   | スタイルファイル。                                                                               |
| `config.toml`         | Hugoにおけるウェブサイトの設定。メタデータ等記載。                                               |
| `layouts/index.html`  | 生成されるHTMLファイルの雛形。ここに全ての内容が埋めこまれる。                                   |
| `required_chars.py`   | 使用される文字からクエリ文字列を出力する。Hugoとは無関係。ウェブフォントの通信料を削減するため。 |
| `static/favicon.png`  | ウェブサイトのアイコン。                                                                         |
| `static/pkg/`         | Suhjong-wasmをビルドして作られるパッケージ。                                                     |
