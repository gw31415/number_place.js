# Number_place.js Example

実際のウェブサイト：[Solve Number-places](https://gw31415.github.io/number_place.js/)

与えられた数独を解くウェブサイトとなっています。
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
└── static
    ├── favicon.png
    ├── round-robin.d.ts
    ├── round-robin.js
    └── pkg/
```

| ファイル                   | 内容                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `assets/script.js`         | スクリプトの本体。`static/pkg` を読みこんでいる。                                                |
| `assets/style.scss`        | スタイルファイル。                                                                               |
| `config.toml`              | Hugoにおけるウェブサイトの設定。メタデータ等記載。                                               |
| `layouts/index.html`       | 生成されるHTMLファイルの雛形。ここに全ての内容が埋めこまれる。                                   |
| `static/favicon.png`       | ウェブサイトのアイコン。                                                                         |
| `static/round-robin.d.ts`  | round-robin.jsの型定義ファイル。                                                                 |
| `static/round-robin.js`    | 総当たりのプログラムをWeb Workerで動かすためのスクリプト。                                       |
| `static/pkg/`              | Number_place.jsをビルドして作られるパッケージ。                                                  |
