# グループメーカー - グループ分けツール

おしゃれなイタリアンカフェ風デザインのグループ分けツールです。

## ✨ 機能

- **スマートなグループ分け**: 過去の履歴を考慮して、同じペアが重複しないようにグループを作成
- **履歴管理**: Web Storageを使用してグループ分けの履歴を自動保存
- **レスポンシブデザイン**: PC・スマートフォン両対応
- **イタリアンカフェ風UI**: おしゃれなデザインで楽しくグループ分け

## 🚀 使い方

### 基本的な使い方

1. **メンバーの入力**
   - テキストエリアに参加者の名前を1行に1人ずつ入力してください
   - 例：
     ```
     田中太郎
     佐藤花子
     鈴木次郎
     ```

2. **グループ数の選択**
   - ドロップダウンメニューから2〜16の間でグループ数を選択してください

3. **グループ作成**
   - 「☕ グループを作成する」ボタンをクリックしてグループ分けを実行

### アルゴリズムについて

- **初回**: 完全ランダムでグループ分けを行います
- **2回目以降**: 過去に同じグループになったペアを最小限に抑えるようにグループを作成します

### 履歴機能

- 同じメンバー構成での過去のグループ分け履歴が自動的に保存されます
- 各グループで「過去同グループ経験」として、そのグループ内で過去に一緒だったペア数を表示します
- 履歴は最新5回分が表示されます

## 🛠️ 技術仕様

- **HTML**: 素のHTML
- **JavaScript**: 素のJavaScript（フレームワーク不使用）
- **CSS**: Tailwind CSS CDN版
- **ストレージ**: Web Storage (localStorage)

## 🌐 デプロイ

### Cloudflare Workersへのデプロイ

このプロジェクトはCloudflare Workersに対応しています。

#### 前提条件

- [Node.js](https://nodejs.org/) がインストールされていること
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) がインストールされていること

#### デプロイ手順

1. **Wrangler CLIのインストール**
   ```bash
   npm install -g wrangler
   ```

2. **Cloudflareアカウントへのログイン**
   ```bash
   wrangler login
   ```

3. **プロジェクトのデプロイ**
   ```bash
   wrangler pages publish
   ```

#### wrangler.tomlの設定

プロジェクトには以下の設定が含まれています：

```toml
name = "group-maker"
main = "index.html"
compatibility_date = "2024-01-01"

[env.production.vars]
ENVIRONMENT = "production"

[[assets]]
bucket = "./public"
include = ["**/*"]
```

### その他のデプロイ方法

#### GitHub Pages

1. GitHubリポジトリにプロジェクトをプッシュ
2. Settings > Pages でソースブランチを設定
3. `index.html`がルートディレクトリにあることを確認

#### Netlify

1. Netlifyアカウントにログイン
2. 「New site from Git」を選択
3. GitHubリポジトリを選択
4. ビルドコマンドは不要（静的サイトのため）

## 📱 対応ブラウザ

- Chrome (推奨)
- Firefox
- Safari
- Edge

## 🔧 開発

### ローカル開発

ローカルでの開発には特別なセットアップは不要です。`index.html`をブラウザで直接開いてください。

### ファイル構成

```
group-maker/
├── index.html          # メインHTMLファイル
├── script.js           # JavaScript機能
├── wrangler.toml       # Cloudflare Workers設定
├── .gitignore          # Git除外設定
├── README.md           # このファイル
└── CLAUDE.md           # 開発ガイドライン
```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

プロジェクトへの貢献を歓迎します！以下の手順でお願いします：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 🐛 バグ報告・機能要望

問題を発見された場合や新機能のご要望がございましたら、GitHubのIssuesでお知らせください。

---

**Buon lavoro! 🇮🇹** (良い仕事を！)