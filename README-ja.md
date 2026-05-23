# gitkraken-i18n
Unofficial GitKraken i18n project  
GitKraken非公式日本語化プロジェクト

このリポジトリは https://github.com/megos/gitkraken-i18n/tree/main からのForkです。

## Change Language

**言語の切り替えは自己責任でお願いします。言語の切り替えによって[不具合](https://github.com/megos/gitkraken-i18n/issues?q=is%3Aissue+is%3Aopen+label%3A%22known+issue%22)が発生することが報告されています。**

1. 切り替えたい言語の`strings.json`を以下の`strings.json`と置き換える
   - Windows: `%LOCALAPPDATA%\gitkraken\app-x.x.x\resources\app.asar.unpacked\src\strings.json`（x.x.xは任意のバージョン）
   - Mac: `/Applications/GitKraken.app/Contents/Resources/app.asar.unpacked/src/strings.json`
1. GitKrakenを再起動
1. 設定を開く  
![Preferences Menu Button](./images/options_button.png)
1. "UI Customization" で言語を選択する 
![UI Customization preferences](./images/ui_customization.png)

## Translate

1. `strings.json`を`{locale}/strings.json`にコピー（`{locale}`は翻訳したい言語）
1. `{locale}/strings.json`を翻訳する
1. [Change Language](#Change%20Language) を元に言語を切り替えて翻訳を確かめる

## GitKraken更新時の日本語ファイル変換

GitKrakenの新しい英語版 `en/strings.json` を元に、既存の日本語訳をできるだけ再利用しながら `ja/strings.json` を更新します。
キーの並び順は英語版に合わせ、未翻訳の新規キーは英語をフォールバックとして入れます。

1. GitKrakenから取得した最新の `strings.json` を `en/strings.json` に配置する
1. 日本語ファイルを英語版のキー順へ同期し、翻訳タスクを分割生成する
   ```sh
   npm run sync:ja
   ```
1. v12.1.2更新前の日本語ファイルを基準にタスクを作り直す場合は、次を実行する
   ```sh
   node scripts/sync-ja-strings.js --ja-source=HEAD:ja/strings.json
   ```
1. `tmp/translation-tasks/001.json` から順番に `ja` を翻訳する
1. 翻訳済みチャンクを `ja/strings.json` に反映する
   ```sh
   npm run apply:ja -- tmp/translation-tasks/001.json
   ```
1. 次のチャンクも同じように反映する
   ```sh
   npm run apply:ja -- tmp/translation-tasks/002.json
   ```
1. 翻訳後に確認する
   ```sh
   npm run textlint:ja
   ```

翻訳時は、`<%= value %>` や `{0}` などの変数をそのまま残してください。
英語のメニュー文言に `&Open` や `Developer &Tools` のような `&` が含まれる場合、これはアクセスキーを示します。
日本語では既存訳に合わせて「リポジトリを開く（&O）」のように末尾へ残してください。
pushは「プッシュ」、pullは「プル」、fetchは「フェッチ」のように、Git利用者に自然な表記を使います。
GitFlowなどの専門用語は無理に翻訳しません。

詳しい手順は [TRANSLATING-ja.md](TRANSLATING-ja.md) を参照してください。
