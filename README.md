# gitkraken-i18n
Unofficial GitKraken i18n project

This repository is a fork of https://github.com/megos/gitkraken-i18n/tree/main.

## Contents
- [Japanese](README-ja.md)

## Change Language

**Please do this at your own risk! Please see [Known issues](https://github.com/megos/gitkraken-i18n/issues?q=is%3Aissue+is%3Aopen+label%3A%22known+issue%22).**

1. Replace project dir `strings.json` to GitKraken's `strings.json`.
   - Windows: `%LOCALAPPDATA%\gitkraken\app-x.x.x\resources\app.asar.unpacked\src\strings.json` (x.x.x is version)
   - Mac: `/Applications/GitKraken.app/Contents/Resources/app.asar.unpacked/src/strings.json`
1. Restart GitKraken.
1. Open the preferences.  
![Preferences Menu Button](./images/options_button.png)
1. Go to "UI Customization" and select the language.  
![UI Customization preferences](./images/ui_customization.png)

## Translate

1. Copy `strings.json` to `{locale}/strings.json`. (`{locale}` is the locale to translate)
1. Translate `{locale}/strings.json`.
1. Check translate [Change Language](#Change%20Language) for reference.

## Updating Japanese Strings

To update `ja/strings.json` from a newer GitKraken `en/strings.json`, sync the key order and generate small translation task files:

```sh
npm run sync:ja
```

Translate `tmp/translation-tasks/001.json`, then apply it back to `ja/strings.json`:

```sh
npm run apply:ja -- tmp/translation-tasks/001.json
```

Repeat this for the remaining task files. See [TRANSLATING-ja.md](TRANSLATING-ja.md) for the full Japanese workflow.
