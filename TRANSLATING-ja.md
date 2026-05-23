# Japanese translation workflow

GitKraken の英語 `en/strings.json` を正として、`ja/strings.json` を同期しながら少しずつ翻訳します。

## 1. 英語のキー順に同期する

```sh
npm run sync:ja
```

既存の日本語訳は同じキーに残し、新規キーは英語をフォールバックとして入れます。
翻訳やレビューが必要な項目は `tmp/translation-tasks/` に分割して出力されます。

v12.1.2 更新前の日本語ファイルを基準にタスクを再生成したい場合は、次を使います。

```sh
node scripts/sync-ja-strings.js --ja-source=HEAD:ja/strings.json
```

## 2. 分割ファイルを翻訳する

`tmp/translation-tasks/001.json` から順に、各項目の `ja` を編集します。
一度に扱う量を小さくするため、デフォルトでは100件ずつ分割されます。

翻訳時の注意:

- `<%= value %>` や `{0}` などの変数はそのまま残す
- 英語のメニュー文言に含まれる `&` はアクセスキーなので、日本語では「リポジトリを開く（&O）」のように末尾へ残す
- push は「プッシュ」、pull は「プル」、fetch は「フェッチ」のように、Git利用者に自然なカタカナ表記を使う
- GitFlow などの専門用語は無理に翻訳しない
- GitクライアントのUI文言として短く自然にする

## 3. 翻訳済みチャンクを反映する

```sh
npm run apply:ja -- tmp/translation-tasks/001.json
```

複数ファイルをまとめて反映することもできます。

```sh
npm run apply:ja -- tmp/translation-tasks/001.json tmp/translation-tasks/002.json
```

`ja` が空、または英語と同じままの項目はスキップします。

## 4. 確認する

```sh
npm run textlint:ja
```

`textlint` が見つからない場合は、先に依存関係をインストールしてください。
