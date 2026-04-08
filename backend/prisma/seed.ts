import {
  PublishStatus,
  Role,
  SitePageKey,
  UserStatus,
  type Center
} from "@prisma/client";
import { prisma } from "../src/db";
import { config } from "../src/config";
import { hashPassword, verifyPassword } from "../src/auth/password";

const centers = [
  {
    centerName: "システムイノベーションセンター",
    domain: "教育連携",
    summary: "教育連携を通じて、高専と会員企業の接点を広げるセンターです。",
    mainActivities: "授業連携、PBL、共同企画、技術人材育成",
    companyRelation: "教育プログラムへの協力、学生との接点づくり、共同テーマ検討"
  },
  {
    centerName: "オープンソリューションセンター",
    domain: "研究連携",
    summary: "研究連携を軸に、高専の技術シーズと企業課題をつなぐセンターです。",
    mainActivities: "共同研究、技術相談、実証実験、技術移転支援",
    companyRelation: "研究テーマ相談、共同研究立ち上げ、技術課題の持ち込み"
  },
  {
    centerName: "地域連携推進センター",
    domain: "就職・生涯学習",
    summary: "地域企業との連携、就職支援、生涯学習支援を担うセンターです。",
    mainActivities: "インターンシップ、キャリア連携、公開講座、地域課題連携",
    companyRelation: "採用連携、地域課題プロジェクト、社会人学び直し企画"
  }
];

const demoCompanies = [
  {
    id: "demo-company-hokuriku-sensing",
    companyName: "北陸センシング株式会社",
    industry: "IoT機器・制御設計",
    address: "新潟県長岡市深沢町2085-16",
    businessSummary:
      "製造現場向けのセンシング端末、制御盤、データ収集ユニットを企画・開発しています。\n既設設備への後付け導入を得意としており、現場で使い続けられる堅牢性を重視した設計を行っています。",
    interestTheme:
      "学生との試作開発、設備データの可視化、現場実証を見据えた共同研究に関心があります。\n少量多品種の組立工程で役立つセンシングテーマを高専と一緒に深めたいと考えています。",
    contactInfo: "demo+hokuriku-sensing@example.com",
    isActive: true
  },
  {
    id: "demo-company-nagaoka-foodlab",
    companyName: "長岡フードラボ株式会社",
    industry: "食品製造・品質管理",
    address: "新潟県長岡市摂田屋4-8-12",
    businessSummary:
      "発酵食品と地域素材を活用した加工食品の製造を行っています。\n温度管理や外観検査の標準化を進めながら、小ロットでも品質を安定させる仕組みづくりに取り組んでいます。",
    interestTheme:
      "食品加工工程の見える化、品質評価、異物混入防止、包装検査の自動化に関心があります。\n学生実習や現場見学と連動したテーマ設定も歓迎しています。",
    contactInfo: "demo+nagaoka-foodlab@example.com",
    isActive: true
  },
  {
    id: "demo-company-echigo-polymer",
    companyName: "越後ポリマー技研株式会社",
    industry: "樹脂成形・材料開発",
    address: "新潟県見附市今町7-3-2",
    businessSummary:
      "樹脂成形品の試作、機能性材料の選定、治具部材の設計支援を行っています。\n小ロット開発案件が多く、量産前評価と試作品の短納期対応に強みがあります。",
    interestTheme:
      "再生材活用、軽量化、耐薬品性評価、成形条件の最適化に関する連携を希望しています。\n実験データの蓄積や評価観点の整理を高専と一緒に進めたい考えです。",
    contactInfo: "demo+echigo-polymer@example.com",
    isActive: true
  },
  {
    id: "demo-company-shinanotech-energy",
    companyName: "信濃テックエナジー株式会社",
    industry: "環境・エネルギー",
    address: "新潟県長岡市城内町3-5-6",
    businessSummary:
      "工場や公共施設向けの省エネ支援、蓄電池活用、設備更新提案を行っています。\n地域のエネルギー利用を可視化し、脱炭素と運用改善を両立する提案型の案件を多く扱っています。",
    interestTheme:
      "排熱利用、蓄電池制御、需要予測、地域エネルギーマネジメントの共同検討に関心があります。\n現場データを使った実証と学生参加型の分析テーマにも前向きです。",
    contactInfo: "demo+shinanotech-energy@example.com",
    isActive: true
  },
  {
    id: "demo-company-yukiguni-dx",
    companyName: "雪国デジタルソリューションズ株式会社",
    industry: "IT・DX支援",
    address: "新潟県長岡市大手通2-2-6",
    businessSummary:
      "地域製造業向けの業務アプリ開発、データ連携、帳票のデジタル化支援を行っています。\n現場の運用定着を重視し、少人数のチームでも無理なく使えるシステム設計を得意としています。",
    interestTheme:
      "作業記録のデジタル化、技能伝承、生成AIを使わない軽量な業務支援、IoT連携基盤に関心があります。\n教育現場と企業現場の両方で使えるツールづくりを目指しています。",
    contactInfo: "demo+yukiguni-dx@example.com",
    isActive: true
  },
  {
    id: "cm0memberdemo00000000000000",
    companyName: "サンプル工業株式会社",
    industry: "精密加工・試作開発",
    address: "新潟県長岡市新産2-1-5",
    businessSummary:
      "精密加工、試作治具製作、装置部品の短納期対応を行う会員企業です。\n研究試作と現場改善の両方に対応しており、加工ノウハウを生かした共同検討を進めています。",
    interestTheme:
      "共同研究、インターンシップ、外観検査、省力化設備の試作に関心があります。\n学生の設計提案を現場検証につなげる取り組みも歓迎しています。",
    contactInfo: "demo+sample-kogyo@example.com",
    isActive: true
  }
];

const demoTechSeeds = [
  {
    id: "demo-techseed-edge-sensing-terminal",
    companyId: "demo-company-hokuriku-sensing",
    seedName: "既設設備向け低消費電力センシング端末",
    seedSummary:
      "既存設備に後付けできる小型センシング端末です。\n振動、電流、温湿度など複数のセンサ入力を一台で扱え、配線工事を最小限に抑えながら稼働状況の見える化を始められます。",
    applicationField: "IoT・センシング",
    usageExample:
      "工作機械や搬送設備の稼働監視、試験機の利用記録、研究設備の環境測定などに活用できます。\n学内実験設備での検証や会員企業の実証導入を組み合わせた検討が可能です。",
    strength:
      "既設機への後付け性、通信断時のローカル保存、少量からのカスタム実装に強みがあります。\n導入初期は必要な項目だけを選び、段階的に計測点を増やせます。",
    relatedResults:
      "県内製造業でのポンプ設備監視、食品工場での冷却設備モニタリング、教育用実習機への装着検証の実績があります。",
    collaborationTheme:
      "センシングデータの解析手法、異常兆候検知、低温環境での通信安定化に関する共同検討を希望しています。"
  },
  {
    id: "demo-techseed-factory-dashboard",
    companyId: "demo-company-hokuriku-sensing",
    seedName: "小規模工場向け設備稼働ダッシュボード基盤",
    seedSummary:
      "センサデータと日報入力をまとめて見られる設備稼働ダッシュボード基盤です。\n現場の担当者が日常運用で使える粒度に絞り、少人数の工場でも扱いやすい構成にしています。",
    applicationField: "データ可視化・設備管理",
    usageExample:
      "設備停止時間の見える化、作業日報との照合、保全タイミングの検討、卒業研究でのラインデータ分析などに活用できます。",
    strength:
      "クラウドとオンプレミスのどちらにも展開しやすく、段階導入がしやすい点が特長です。\n収集端末と表示画面を分離できるため、検証の自由度も高くなっています。",
    relatedResults:
      "部品加工ラインの稼働可視化、工場見学向けのモニタ表示、技術協力会イベントでのデモ展示に活用した実績があります。",
    collaborationTheme:
      "教育用途も含めた可視化指標の設計、UI改善、異常時通知ルールの検証を高専と進めたいと考えています。"
  },
  {
    id: "demo-techseed-fermentation-monitor",
    companyId: "demo-company-nagaoka-foodlab",
    seedName: "発酵食品向け温湿度・熟成データ可視化",
    seedSummary:
      "発酵工程の温湿度、熟成日数、検査記録を一体管理するためのデータ整理手法です。\n作業者ごとの差を減らしながら、品質の再現性を高める運用を支援します。",
    applicationField: "食品品質管理",
    usageExample:
      "みそ、漬物、発酵調味料の製造工程管理や、試作品ごとの比較評価、実習テーマでの発酵条件の見える化に使えます。",
    strength:
      "紙記録からの移行がしやすく、既存運用を大きく変えずに工程データを蓄積できる点が強みです。",
    relatedResults:
      "少量製造ラインでの熟成条件比較、商品開発会議でのデータ共有、社内勉強会向けの品質レビュー資料作成に活用しています。",
    collaborationTheme:
      "品質評価指標の整理、発酵条件と官能評価の関係分析、工程ごとの注意点の可視化を共同で進めたいです。"
  },
  {
    id: "demo-techseed-package-inspection",
    companyId: "demo-company-nagaoka-foodlab",
    seedName: "画像による包装外観検査テンプレート",
    seedSummary:
      "袋詰め製品やラベル貼付後の包装状態を確認するための簡易外観検査テンプレートです。\n照明条件と撮像位置を標準化し、小規模ラインでも導入しやすい構成にしています。",
    applicationField: "画像検査・品質保証",
    usageExample:
      "印字ずれ、ラベル傾き、シール不良、パッケージ表面の汚れ確認などの検査補助に利用できます。",
    strength:
      "検査対象が変わっても設定変更がしやすく、教育用サンプルとしても扱いやすい点が特長です。\n手検査と併用しながら段階導入できます。",
    relatedResults:
      "期間限定商品の包装確認、校内展示用サンプルの品質確認、工程改善会議での比較資料作成に活用しています。",
    collaborationTheme:
      "撮像条件の最適化、良否判定の基準整理、画像特徴量の比較などで高専との連携を希望しています。"
  },
  {
    id: "demo-techseed-elastomer-prototype",
    companyId: "demo-company-echigo-polymer",
    seedName: "高耐久エラストマー部材の試作評価",
    seedSummary:
      "繰り返し荷重や低温環境に配慮したエラストマー部材の試作評価ノウハウです。\n使用環境を想定した材料選定と簡易試験を組み合わせ、初期段階の比較検討を進めやすくしています。",
    applicationField: "材料評価・部材試作",
    usageExample:
      "防振部材、シール材、把持部品、搬送設備向けの緩衝部材などの試作検討に活用できます。",
    strength:
      "小ロットでも比較評価しやすく、樹脂・ゴム系の候補材料を短期間で絞り込める点が強みです。",
    relatedResults:
      "寒冷地向け装置部材、薬液ライン用パッキン、研究治具の柔軟部品の試作評価に対応した実績があります。",
    collaborationTheme:
      "材料劣化の見極め、簡易試験条件の設計、再生材混合時の物性比較を共同で進めたいです。"
  },
  {
    id: "demo-techseed-resin-flow-support",
    companyId: "demo-company-echigo-polymer",
    seedName: "小ロット向け樹脂流動シミュレーション支援",
    seedSummary:
      "試作前の初期検討に使いやすい、樹脂流動の簡易シミュレーション支援です。\n金型形状の大きな見直し前に、流れやすさや偏肉の傾向を把握する用途を想定しています。",
    applicationField: "樹脂成形・CAE",
    usageExample:
      "試作品のゲート位置検討、薄肉部の充填確認、成形条件の比較、学生向け演習テーマのケーススタディに利用できます。",
    strength:
      "初期の方向付けに必要な情報を短時間で整理でき、量産前の検討コストを抑えやすい点が特長です。",
    relatedResults:
      "治具部材の形状見直し、軽量化部品の試作前評価、企業内の成形勉強会資料作成に活用しています。",
    collaborationTheme:
      "材料データの整理、評価モデルの妥当性確認、成形不良の再現条件の検討を高専と進めたいです。"
  },
  {
    id: "demo-techseed-waste-heat-recovery",
    companyId: "demo-company-shinanotech-energy",
    seedName: "工場排熱の簡易回収ユニット設計",
    seedSummary:
      "乾燥炉やコンプレッサ周辺の低中温排熱を回収するための簡易ユニット設計案です。\n既存設備に大きな手を入れず、予備調査と小規模実証から始めることを前提にしています。",
    applicationField: "省エネ・熱利用",
    usageExample:
      "工場の給湯予熱、乾燥工程の補助、冬季の作業環境改善、実証研究の検討材料として活用できます。",
    strength:
      "導入前の概算評価がしやすく、現場条件に合わせて段階的に検討を進められる点が強みです。",
    relatedResults:
      "工場空調の補助検討、給湯負荷の平準化、施設見学会での省エネ事例紹介に活用した実績があります。",
    collaborationTheme:
      "排熱量の見積り、回収効率の評価、運用条件による効果変動の解析を共同で進めたいと考えています。"
  },
  {
    id: "demo-techseed-battery-optimization",
    companyId: "demo-company-shinanotech-energy",
    seedName: "地域拠点向け蓄電池運用最適化モデル",
    seedSummary:
      "小規模拠点の電力使用状況に合わせて、蓄電池の充放電タイミングを整理する運用モデルです。\n再エネ導入や災害時利用も見据え、運用ルールを比較しやすい形にまとめています。",
    applicationField: "エネルギーマネジメント",
    usageExample:
      "公共施設、研究棟、工場事務所などでのピークカット検討や、実証データを使った評価演習に利用できます。",
    strength:
      "実測データが少ない段階でも検討を始めやすく、複数パターンの運用比較に向いています。",
    relatedResults:
      "施設更新計画時の比較検討、地域防災拠点の電源計画、会員企業向け勉強会でのシミュレーション紹介に活用しています。",
    collaborationTheme:
      "需要予測、再エネ併用時の運用評価、教育用途を含めた可視化手法の改善に関心があります。"
  },
  {
    id: "demo-techseed-worklog-platform",
    companyId: "demo-company-yukiguni-dx",
    seedName: "技能伝承向け作業ログ収集アプリ基盤",
    seedSummary:
      "紙や口頭で残りがちな作業記録を、無理なくデジタル化するための軽量アプリ基盤です。\n現場で必要な情報だけを素早く残せるよう、操作項目を絞った構成にしています。",
    applicationField: "業務DX・記録管理",
    usageExample:
      "設備点検、試作手順、段取り替え、実験記録、インターンシップ中の作業振り返りなどに活用できます。",
    strength:
      "タブレットでも使いやすく、導入時に大規模な教育を要しない点が特長です。\n既存のExcel管理とも段階的に連携できます。",
    relatedResults:
      "保守点検記録、現場改善活動の履歴管理、作業引継ぎメモの電子化に活用した実績があります。",
    collaborationTheme:
      "教育現場でも使える入力設計、作業分類の整理、分析に使いやすいデータ構造の検討を希望しています。"
  },
  {
    id: "demo-techseed-estimate-process-link",
    companyId: "demo-company-yukiguni-dx",
    seedName: "受託製造向け見積・工程データ連携",
    seedSummary:
      "見積作成時の条件と実際の工程データをつなげ、次回案件に生かしやすくするための連携設計です。\n属人的になりやすい見積根拠を整理し、案件振り返りをしやすくします。",
    applicationField: "見積支援・工程最適化",
    usageExample:
      "試作案件の見積精度向上、工数実績の蓄積、案件レビュー、学生の業務改善提案テーマに活用できます。",
    strength:
      "既存システムを置き換えずに始めやすく、必要項目だけを段階的に連携できる点が強みです。",
    relatedResults:
      "個別受注製品の案件レビュー、工程会議でのデータ共有、原価見直しの検討資料として利用しています。",
    collaborationTheme:
      "入力負荷を増やさない設計、見積根拠の分析、工数ばらつき要因の整理を共同で進めたいです。"
  },
  {
    id: "demo-techseed-thin-aluminum",
    companyId: "cm0memberdemo00000000000000",
    seedName: "薄肉アルミ筐体の高精度試作加工",
    seedSummary:
      "薄肉アルミ筐体を短納期で試作するための加工ノウハウです。\n変形を抑える工程設計と治具構成を組み合わせ、試作段階での精度確保を重視しています。",
    applicationField: "精密加工・試作",
    usageExample:
      "センサ筐体、計測機器ケース、実験装置の外装、学生プロジェクトの試作部品などに活用できます。",
    strength:
      "加工条件の調整幅が広く、設計変更への追従がしやすい点が強みです。\n試作治具も含めて短納期で検討できます。",
    relatedResults:
      "検査装置カバー、教育用ロボット筐体、展示会向け試作品の製作で活用した実績があります。",
    collaborationTheme:
      "薄肉部の振動抑制、治具最適化、加工後測定の効率化に関する共同検討を希望しています。"
  },
  {
    id: "demo-techseed-smart-jig-sensor",
    companyId: "cm0memberdemo00000000000000",
    seedName: "切削加工ライン向け治具内蔵センサユニット",
    seedSummary:
      "加工治具に荷重や接触状態を検知するセンサを組み込むためのユニット構成です。\n作業者の勘に頼りやすい段取り確認を、簡易な信号で補助できるよう設計しています。",
    applicationField: "加工治具・センシング",
    usageExample:
      "段取り確認、ワーク着座チェック、加工条件の評価、実習テーマでの治具改善検討に活用できます。",
    strength:
      "既存治具に組み込みやすく、比較的低コストで試せる点が特長です。\n加工現場の実情に合わせたカスタム調整にも対応できます。",
    relatedResults:
      "着座不良の検知補助、試作品評価のログ取得、現場改善提案のデモ機として利用した実績があります。",
    collaborationTheme:
      "信号処理の簡素化、耐切粉性の改善、治具設計との一体最適化を高専と進めたいです。"
  },
  {
    id: "demo-techseed-visual-inspection-stage",
    companyId: "cm0memberdemo00000000000000",
    seedName: "現場設備向け後付け外観検査ステージ",
    seedSummary:
      "小型部品や加工面を撮像しやすくする後付け型の外観検査ステージです。\n照明と位置決めを簡易に標準化し、目視検査のばらつきを減らす用途を想定しています。",
    applicationField: "外観検査・省力化",
    usageExample:
      "加工傷確認、印字確認、組立前の部材チェック、教育展示用の画像検査デモに使えます。",
    strength:
      "既存設備の近くに置いて使える省スペース設計で、試作評価から始めやすい点が強みです。",
    relatedResults:
      "アルミ部品の表面確認、樹脂部材の外観比較、会員企業向け見学会での検査デモ展示に活用しました。",
    collaborationTheme:
      "撮像条件の最適化、判定アルゴリズムの比較、検査治具の改良に関する共同検討を希望しています。"
  }
];

const demoNews = [
  {
    id: "demo-news-briefing-materials",
    title: "地域課題テーマ説明会の資料を掲載しました",
    body:
      "会員企業向けに実施した地域課題テーマ説明会の資料を掲載しました。\n長岡高専との共同検討を始める際の進め方や、センターごとの相談窓口をまとめています。\n\n新規テーマの相談前に確認しておくとスムーズな項目も整理していますので、活動報告や支援プロジェクトとあわせてご覧ください。",
    category: "制度案内",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-01-29T09:00:00+09:00")
  },
  {
    id: "demo-news-pbl-showcase",
    title: "学生PBL成果共有会を開催しました",
    body:
      "会員企業との連携テーマを扱った学生PBLの成果共有会を開催しました。\n加工治具、センシング、業務改善アプリなど複数分野の成果を紹介し、次年度テーマの検討も始まっています。\n\n参加企業からのコメントを踏まえ、活動報告ページにも関連内容を順次掲載します。",
    category: "連携報告",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-02-18T14:30:00+09:00")
  },
  {
    id: "demo-news-maintenance",
    title: "ポータル保守作業のお知らせ（完了）",
    body:
      "会員向けポータルの保守作業を実施し、一覧画面と詳細画面の表示を改善しました。\n現在は通常どおり利用できます。\n\n本更新にあわせて、お知らせ、活動報告、技術シーズの表示内容も見直しています。",
    category: "メンテナンス",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-05T08:45:00+09:00")
  },
  {
    id: "demo-news-mini-expo",
    title: "会員企業向けミニ展示会の参加募集について",
    body:
      "技術協力会の会員企業向けに、技術シーズ紹介と試作品展示を中心としたミニ展示会を開催します。\n出展希望企業は、自社の技術シーズや試作事例をポータル経由で共有いただけます。\n\n展示内容の相談はオープンソリューションセンターまでお寄せください。",
    category: "イベント案内",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-20T10:00:00+09:00")
  },
  {
    id: "demo-news-kyodo-research-2026",
    title: "令和8年度 共同研究・技術相談の受付を開始します",
    body:
      "令和8年度の共同研究、技術相談、実証検討の受付を開始します。\n研究連携だけでなく、教育連携や地域連携を含む相談も対象です。\n\nまずは支援プロジェクトやセンター紹介を確認のうえ、関心の近いテーマからご相談ください。",
    category: "募集",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-04-01T09:30:00+09:00")
  },
  {
    id: "demo-news-techseed-update",
    title: "技術シーズ掲載ページを更新しました",
    body:
      "会員企業の技術シーズを見つけやすくするため、掲載内容を拡充しました。\n精密加工、食品品質管理、樹脂成形、エネルギー、業務DXなど、分野の異なるシーズを追加しています。\n\nホーム画面の更新情報からも新着シーズを確認できます。",
    category: "公開案内",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-04-05T11:00:00+09:00")
  }
];

const demoSupportProjects = [
  {
    id: "demo-project-resin-reuse",
    projectName: "再生材を活用した樹脂部材評価プロジェクト",
    summary:
      "再生材の活用可能性を探りながら、地域企業で使いやすい評価手順を整理するプロジェクトです。",
    background:
      "環境配慮の観点から再生材の活用ニーズが高まる一方で、小ロット試作の段階では評価手順が属人的になりやすい状況があります。\n県内企業からも、量産前に比較検討しやすい枠組みを求める声が上がっています。",
    issue:
      "材料ごとのばらつきや耐久性の見極めに時間がかかり、試作判断の根拠が共有しにくい点が課題です。",
    goal:
      "再生材を含む候補材料を比較し、用途別に確認すべき評価観点を整理します。\n会員企業が初期検討で使える実践的なチェック項目の整備を目指します。",
    supportNeeded:
      "材料評価、簡易試験条件の設計、比較結果の見える化、試作形状の整理に協力いただける企業を募集しています。",
    expectedResult:
      "再生材検討の初期判断に使える評価テンプレートと、会員企業間で共有しやすい検討事例の蓄積を想定しています。",
    contactInfo: "オープンソリューションセンター / demo-projects@example.com",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-02-10T10:00:00+09:00"),
    centerNames: ["オープンソリューションセンター"]
  },
  {
    id: "demo-project-food-quality",
    projectName: "食品加工ラインの品質記録標準化プロジェクト",
    summary:
      "食品加工工程の品質記録を標準化し、現場負荷を増やさずに改善につなげる取り組みです。",
    background:
      "小規模な食品製造現場では、品質記録が紙と口頭確認に分散しやすく、改善履歴の振り返りに時間がかかっています。\n地域素材を扱う会員企業からも、工程条件の見える化に関する相談が増えています。",
    issue:
      "温湿度、外観確認、作業条件の記録形式が揃わず、検証時に比較しづらい点が課題です。",
    goal:
      "工程ごとに必要な記録項目を整理し、品質確認と改善検討の両方に使える記録テンプレートを整備します。",
    supportNeeded:
      "食品製造、画像検査、データ整理、現場導入支援の知見を持つ企業と一緒に、現場で回る記録方法を検討したいと考えています。",
    expectedResult:
      "品質記録の標準化案と、工程改善に使えるサンプルデータを蓄積し、会員企業向けの共有事例として展開します。",
    contactInfo: "地域連携推進センター / demo-projects@example.com",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-02-24T13:00:00+09:00"),
    centerNames: ["オープンソリューションセンター", "地域連携推進センター"]
  },
  {
    id: "demo-project-smart-factory",
    projectName: "加工現場のスマートファクトリー小規模実証",
    summary:
      "既設設備に後付けできるセンシングと可視化を組み合わせ、現場改善につなげる実証プロジェクトです。",
    background:
      "会員企業から、設備更新を伴わずに稼働状況を把握したいという相談が継続的に寄せられています。\n教育面では、学生が現場課題を理解しながらデータ活用を学べる題材としても期待されています。",
    issue:
      "設備や作業の停止要因が見えにくく、改善テーマの優先順位づけが難しい点が課題です。",
    goal:
      "センシング、日報、簡易ダッシュボードを組み合わせ、現場改善に使える最小構成を整理します。",
    supportNeeded:
      "センシング端末、治具設計、ダッシュボード作成、現場ヒアリングに協力できる企業を募集しています。",
    expectedResult:
      "複数業種に展開しやすい実証テンプレートと、教育連携にも使える課題設定例の整備を見込んでいます。",
    contactInfo: "システムイノベーションセンター / demo-projects@example.com",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-08T09:00:00+09:00"),
    centerNames: ["システムイノベーションセンター", "オープンソリューションセンター"]
  },
  {
    id: "demo-project-energy-visualization",
    projectName: "地域拠点のエネルギー可視化・運用改善プロジェクト",
    summary:
      "施設の電力利用を可視化し、蓄電池や省エネ施策の運用改善につなげる実証プロジェクトです。",
    background:
      "公共施設や事業所では、設備更新だけでなく運用改善による省エネ効果の見える化が求められています。\n地域の防災拠点としての活用も視野に入れた相談が増えています。",
    issue:
      "需要の波や設備ごとの消費傾向が把握しづらく、改善施策の比較検討に時間がかかる点が課題です。",
    goal:
      "計測データをもとに運用パターンを比較し、現実的な改善案と教育用の検討素材を整備します。",
    supportNeeded:
      "計測設計、蓄電池運用、可視化画面、地域実証の調整に協力いただける企業と連携したいと考えています。",
    expectedResult:
      "小規模拠点向けのエネルギー見える化モデルと、共同研究テーマへ発展しやすい実証条件の整理を目指します。",
    contactInfo: "地域連携推進センター / demo-projects@example.com",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-22T15:00:00+09:00"),
    centerNames: ["オープンソリューションセンター", "地域連携推進センター"]
  },
  {
    id: "demo-project-field-service-dx",
    projectName: "現場保守業務の記録DX支援プロジェクト",
    summary:
      "点検や保守作業の記録をデジタル化し、技能継承と業務改善につなげるプロジェクトです。",
    background:
      "保守現場では、紙の点検票や口頭共有に依存する運用が残っており、引継ぎや振り返りに時間を要しています。\n若手育成と記録の標準化を両立したいという相談が増えています。",
    issue:
      "作業記録の粒度が揃わず、改善提案や教育資料に転用しにくい点が課題です。",
    goal:
      "保守現場で使いやすい入力項目を整理し、教育連携にも活用できる記録DXの雛形を整備します。",
    supportNeeded:
      "保守業務、業務アプリ、UI設計、現場ヒアリングの知見を持つ会員企業との連携を希望しています。",
    expectedResult:
      "記録フォーマット、入力画面の試作、改善効果を確認するための運用例をまとめる予定です。",
    contactInfo: "システムイノベーションセンター / demo-projects@example.com",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-04-03T10:30:00+09:00"),
    centerNames: ["システムイノベーションセンター", "地域連携推進センター"]
  }
];

const demoActivityReports = [
  {
    id: "demo-report-company-tour-career",
    title: "会員企業見学会とキャリア対話を実施しました",
    summary:
      "地域企業の現場を学生が見学し、若手社員との対話を通じて働き方と技術の関わりを学ぶ機会を設けました。",
    body:
      "地域連携推進センターが中心となり、会員企業2社の見学会を実施しました。\n製造現場での改善活動や、業務のデジタル化が現場でどのように使われているかを紹介いただきました。\n\n後半は若手社員との対話時間を設け、就職後に必要となる視点や、現場で求められるコミュニケーションについて意見交換を行いました。\n企業側からは、見学だけでなく改善テーマの持ち帰りにつながる企画にしたいという提案もあり、次年度企画の検討を始めています。",
    category: "キャリア連携",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-02-12T16:00:00+09:00"),
    centerNames: ["地域連携推進センター"],
    projectIds: []
  },
  {
    id: "demo-report-resin-material-meeting",
    title: "再生材評価に向けた材料比較ミーティングを開催",
    summary:
      "再生材を含む樹脂材料の評価観点を整理するため、会員企業と教員で比較ミーティングを行いました。",
    body:
      "オープンソリューションセンターが調整役となり、樹脂成形や材料評価に関わる会員企業と教員が集まりました。\n用途ごとに重視すべき物性や、初期評価で見落としやすい観点を持ち寄り、試作前に確認したい項目を整理しました。\n\n会議では、再生材の配合率だけでなく、使用環境を踏まえた簡易試験の条件設定が重要であることが共有されました。\n今後は支援プロジェクトと連動し、比較しやすい評価テンプレートづくりを進めます。",
    category: "研究連携",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-02-28T13:30:00+09:00"),
    centerNames: ["オープンソリューションセンター"],
    projectIds: ["demo-project-resin-reuse"]
  },
  {
    id: "demo-report-food-sensing-workshop",
    title: "食品加工現場の品質記録ワークショップを実施",
    summary:
      "食品加工企業と高専側で、品質記録と工程見える化の実践課題を共有するワークショップを行いました。",
    body:
      "食品製造に携わる会員企業を交え、品質記録の標準化と見える化をテーマにワークショップを開催しました。\n工程ごとの温湿度記録、包装確認、作業メモの残し方を洗い出し、無理なく続けられる記録粒度を議論しました。\n\n参加者からは、現場負荷を増やさずに改善に使える記録方法が必要との意見が多く、画像検査の簡易活用にも関心が集まりました。\n今後は支援プロジェクトに接続し、記録テンプレートと改善事例の整理を進めます。",
    category: "地域課題連携",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-03T15:30:00+09:00"),
    centerNames: ["オープンソリューションセンター", "地域連携推進センター"],
    projectIds: ["demo-project-food-quality"]
  },
  {
    id: "demo-report-smart-factory-pbl",
    title: "加工現場の可視化をテーマにPBL成果発表を実施",
    summary:
      "センシング端末と簡易ダッシュボードを組み合わせ、加工現場の見える化を題材にしたPBL成果を共有しました。",
    body:
      "システムイノベーションセンターとオープンソリューションセンターが連携し、会員企業の現場課題を題材にしたPBL成果発表を行いました。\n学生チームは、設備停止要因の整理、治具側で取得できる情報、ダッシュボードに必要な表示項目を提案しました。\n\n企業側からは、設備更新を伴わない小規模実証として始めやすい構成だという評価がありました。\n今後は実証プロジェクトと接続し、現場導入時の計測項目と運用ルールをさらに詰めていきます。",
    category: "教育連携",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-14T17:00:00+09:00"),
    centerNames: ["システムイノベーションセンター", "オープンソリューションセンター"],
    projectIds: ["demo-project-smart-factory"]
  },
  {
    id: "demo-report-energy-visualization-poc",
    title: "地域拠点の電力可視化PoCを開始しました",
    summary:
      "施設の電力利用を見える化するPoCを開始し、改善施策の比較に向けた計測項目を整理しました。",
    body:
      "地域連携推進センターとオープンソリューションセンターが連携し、地域拠点でのエネルギー可視化PoCを開始しました。\n施設担当者との打ち合わせを通じ、日別・時間帯別の消費傾向と、蓄電池運用を検討する際に必要な指標を整理しています。\n\nPoCでは、教育用途にも転用しやすいよう、計測項目と可視化画面を絞り込んでいます。\n今後は会員企業の知見も取り入れ、需要変動を踏まえた改善パターンの比較につなげる予定です。",
    category: "実証実験",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-03-27T11:00:00+09:00"),
    centerNames: ["オープンソリューションセンター", "地域連携推進センター"],
    projectIds: ["demo-project-energy-visualization"]
  },
  {
    id: "demo-report-dx-logbook-trial",
    title: "保守作業ログのデジタル化試行を開始",
    summary:
      "点検業務の記録をデジタル化する試行を始め、教育連携と現場改善の両面から評価を進めています。",
    body:
      "システムイノベーションセンターと地域連携推進センターが中心となり、保守作業ログのデジタル化試行を開始しました。\n会員企業の現場担当者と一緒に、入力項目を最小限にしながら振り返りに必要な情報を残せる形を検討しています。\n\n学生側からは、入力しやすさと後から分析しやすい構造を両立させたいという提案がありました。\n今後は教育用の演習テーマにも広げながら、実際の現場で使える記録DXの雛形に仕上げていく予定です。",
    category: "業務改善",
    publishStatus: PublishStatus.PUBLISHED,
    publishedAt: new Date("2026-04-04T14:00:00+09:00"),
    centerNames: ["システムイノベーションセンター", "地域連携推進センター"],
    projectIds: ["demo-project-field-service-dx"]
  }
];

const normalizeValue = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ?? null;
};

const hasChanges = (current: Record<string, unknown>, next: Record<string, unknown>) =>
  Object.entries(next).some(([key, value]) => normalizeValue(current[key]) !== normalizeValue(value));

const sortKeys = (values: string[]) => [...values].sort();

const sameKeySet = (left: string[], right: string[]) =>
  JSON.stringify(sortKeys(left)) === JSON.stringify(sortKeys(right));

type SeedUserCreateData = {
  loginId: string;
  email: string;
  userName: string;
  role: Role;
  status: UserStatus;
  companyId?: string | null;
  mustChangePassword: boolean;
};

type SeedUserUpdateData = {
  email: string;
  userName: string;
  role: Role;
  status: UserStatus;
  companyId: string | null;
  mustChangePassword: boolean;
};

const syncRecord = async <
  TRecord extends Record<string, unknown>,
  TCreate,
  TUpdate extends Record<string, unknown>
>({
  label,
  key,
  findExisting,
  create,
  update,
  createData,
  updateData
}: {
  label: string;
  key: string;
  findExisting: () => Promise<TRecord | null>;
  create: (data: TCreate) => Promise<TRecord>;
  update: (data: TUpdate) => Promise<TRecord>;
  createData: TCreate;
  updateData: TUpdate;
}) => {
  const current = await findExisting();

  if (!current) {
    // Keep seed output readable when docker-compose starts.
    console.info(`[seed] create ${label}: ${key}`);
    return create(createData);
  }

  if (!hasChanges(current, updateData)) {
    console.info(`[seed] keep ${label}: ${key}`);
    return current;
  }

  console.info(`[seed] update ${label}: ${key}`);
  return update(updateData);
};

const syncUserByLoginId = async ({
  loginId,
  password,
  createData,
  updateData
}: {
  loginId: string;
  password: string;
  createData: SeedUserCreateData;
  updateData: SeedUserUpdateData;
}) => {
  const current = await prisma.user.findUnique({
    where: { loginId }
  });

  if (!current) {
    console.info(`[seed] create user: ${loginId}`);
    return prisma.user.create({
      data: {
        ...createData,
        passwordHash: await hashPassword(password)
      }
    });
  }

  const passwordMatches = await verifyPassword(password, current.passwordHash);
  const comparableUpdateData = updateData as Record<string, unknown>;

  if (passwordMatches && !hasChanges(current as unknown as Record<string, unknown>, comparableUpdateData)) {
    console.info(`[seed] keep user: ${loginId}`);
    return current;
  }

  console.info(`[seed] update user: ${loginId}`);
  return prisma.user.update({
    where: { loginId },
    data: {
      ...updateData,
      ...(passwordMatches ? {} : { passwordHash: await hashPassword(password) })
    }
  });
};

const syncRelationSet = async <TPair extends Record<string, string>>({
  label,
  desiredPairs,
  fetchExisting,
  clear,
  createMany,
  pairKey
}: {
  label: string;
  desiredPairs: TPair[];
  fetchExisting: () => Promise<TPair[]>;
  clear: () => Promise<unknown>;
  createMany: (pairs: TPair[]) => Promise<unknown>;
  pairKey: (pair: TPair) => string;
}) => {
  const existingPairs = await fetchExisting();
  const desiredKeys = desiredPairs.map(pairKey);
  const existingKeys = existingPairs.map(pairKey);

  if (sameKeySet(existingKeys, desiredKeys)) {
    console.info(`[seed] keep ${label}`);
    return;
  }

  console.info(`[seed] sync ${label}`);
  await clear();

  if (desiredPairs.length > 0) {
    await createMany(desiredPairs);
  }
};

const seed = async () => {
  const admin = await syncUserByLoginId({
    loginId: config.initialAdmin.loginId,
    password: config.initialAdmin.password,
    createData: {
      loginId: config.initialAdmin.loginId,
      email: config.initialAdmin.email,
      userName: config.initialAdmin.userName,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: true
    },
    updateData: {
      email: config.initialAdmin.email,
      userName: config.initialAdmin.userName,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      companyId: null,
      mustChangePassword: true
    }
  });

  const syncedCenters = [] as Center[];
  for (const center of centers) {
    const item = await syncRecord({
      label: "center",
      key: center.centerName,
      findExisting: () =>
        prisma.center.findUnique({
          where: { centerName: center.centerName }
        }),
      create: (data) =>
        prisma.center.create({
          data
        }),
      update: (data) =>
        prisma.center.update({
          where: { centerName: center.centerName },
          data
        }),
      createData: {
        ...center,
        createdBy: admin.id,
        updatedBy: admin.id
      },
      updateData: {
        ...center,
        updatedBy: admin.id
      }
    });

    syncedCenters.push(item);
  }

  await syncRecord({
    label: "site page",
    key: "about_terms",
    findExisting: () =>
      prisma.sitePage.findUnique({
        where: { pageKey: SitePageKey.ABOUT_TERMS }
      }),
    create: (data) =>
      prisma.sitePage.create({
        data
      }),
    update: (data) =>
      prisma.sitePage.update({
        where: { pageKey: SitePageKey.ABOUT_TERMS },
        data
      }),
    createData: {
      pageKey: SitePageKey.ABOUT_TERMS,
      title: "サイトについて・利用規約",
      body:
        "本サイトは技術協力会が運用する会員企業向けポータルサイトです。学校公式サイトではありません。利用者はログインのうえ、会員向け情報の閲覧、企業情報の更新、技術シーズの登録を行えます。",
      updatedBy: admin.id
    },
    updateData: {
      title: "サイトについて・利用規約",
      body:
        "本サイトは技術協力会が運用する会員企業向けポータルサイトです。学校公式サイトではありません。利用者はログインのうえ、会員向け情報の閲覧、企業情報の更新、技術シーズの登録を行えます。",
      updatedBy: admin.id
    }
  });

  for (const company of demoCompanies) {
    await syncRecord({
      label: "company",
      key: company.companyName,
      findExisting: () =>
        prisma.company.findUnique({
          where: { id: company.id }
        }),
      create: (data) =>
        prisma.company.create({
          data
        }),
      update: (data) =>
        prisma.company.update({
          where: { id: company.id },
          data
        }),
      createData: company,
      updateData: {
        companyName: company.companyName,
        industry: company.industry,
        address: company.address,
        businessSummary: company.businessSummary,
        interestTheme: company.interestTheme,
        contactInfo: company.contactInfo,
        isActive: company.isActive
      }
    });
  }

  await syncUserByLoginId({
    loginId: "member-demo",
    password: "member-demo-123",
    createData: {
      loginId: "member-demo",
      email: "member-demo@example.com",
      userName: "会員デモ担当",
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      companyId: "cm0memberdemo00000000000000",
      mustChangePassword: true
    },
    updateData: {
      email: "member-demo@example.com",
      userName: "会員デモ担当",
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      companyId: "cm0memberdemo00000000000000",
      mustChangePassword: true
    }
  });

  await prisma.news.deleteMany({
    where: {
      id: {
        notIn: demoNews.map((item) => item.id)
      },
      title: "会員向けポータルを公開しました",
      category: "お知らせ",
      body: "技術協力会の会員企業向けポータルを公開しました。最新情報や支援プロジェクトを確認できます。",
      createdBy: admin.id
    }
  });

  for (const news of demoNews) {
    await syncRecord({
      label: "news",
      key: news.id,
      findExisting: () =>
        prisma.news.findUnique({
          where: { id: news.id }
        }),
      create: (data) =>
        prisma.news.create({
          data
        }),
      update: (data) =>
        prisma.news.update({
          where: { id: news.id },
          data
        }),
      createData: {
        ...news,
        createdBy: admin.id,
        updatedBy: admin.id
      },
      updateData: {
        title: news.title,
        body: news.body,
        category: news.category,
        publishStatus: news.publishStatus,
        publishedAt: news.publishedAt,
        updatedBy: admin.id
      }
    });
  }

  for (const techSeed of demoTechSeeds) {
    await syncRecord({
      label: "tech seed",
      key: techSeed.id,
      findExisting: () =>
        prisma.techSeed.findUnique({
          where: { id: techSeed.id }
        }),
      create: (data) =>
        prisma.techSeed.create({
          data
        }),
      update: (data) =>
        prisma.techSeed.update({
          where: { id: techSeed.id },
          data
        }),
      createData: techSeed,
      updateData: {
        companyId: techSeed.companyId,
        seedName: techSeed.seedName,
        seedSummary: techSeed.seedSummary,
        applicationField: techSeed.applicationField,
        usageExample: techSeed.usageExample,
        strength: techSeed.strength,
        relatedResults: techSeed.relatedResults,
        collaborationTheme: techSeed.collaborationTheme
      }
    });
  }

  for (const project of demoSupportProjects) {
    await syncRecord({
      label: "support project",
      key: project.id,
      findExisting: () =>
        prisma.supportProject.findUnique({
          where: { id: project.id }
        }),
      create: (data) =>
        prisma.supportProject.create({
          data
        }),
      update: (data) =>
        prisma.supportProject.update({
          where: { id: project.id },
          data
        }),
      createData: {
        id: project.id,
        projectName: project.projectName,
        summary: project.summary,
        background: project.background,
        issue: project.issue,
        goal: project.goal,
        supportNeeded: project.supportNeeded,
        expectedResult: project.expectedResult,
        contactInfo: project.contactInfo,
        publishStatus: project.publishStatus,
        publishedAt: project.publishedAt,
        createdBy: admin.id,
        updatedBy: admin.id
      },
      updateData: {
        projectName: project.projectName,
        summary: project.summary,
        background: project.background,
        issue: project.issue,
        goal: project.goal,
        supportNeeded: project.supportNeeded,
        expectedResult: project.expectedResult,
        contactInfo: project.contactInfo,
        publishStatus: project.publishStatus,
        publishedAt: project.publishedAt,
        updatedBy: admin.id
      }
    });
  }

  for (const report of demoActivityReports) {
    await syncRecord({
      label: "activity report",
      key: report.id,
      findExisting: () =>
        prisma.activityReport.findUnique({
          where: { id: report.id }
        }),
      create: (data) =>
        prisma.activityReport.create({
          data
        }),
      update: (data) =>
        prisma.activityReport.update({
          where: { id: report.id },
          data
        }),
      createData: {
        id: report.id,
        title: report.title,
        summary: report.summary,
        body: report.body,
        category: report.category,
        publishStatus: report.publishStatus,
        publishedAt: report.publishedAt,
        createdBy: admin.id,
        updatedBy: admin.id
      },
      updateData: {
        title: report.title,
        summary: report.summary,
        body: report.body,
        category: report.category,
        publishStatus: report.publishStatus,
        publishedAt: report.publishedAt,
        updatedBy: admin.id
      }
    });
  }

  const centerIdByName = new Map(syncedCenters.map((center) => [center.centerName, center.id]));
  const activityReportIds = demoActivityReports.map((report) => report.id);
  const supportProjectIds = demoSupportProjects.map((project) => project.id);

  await syncRelationSet({
    label: "activity report centers",
    desiredPairs: demoActivityReports.flatMap((report) =>
      report.centerNames.map((centerName) => {
        const centerId = centerIdByName.get(centerName);

        if (!centerId) {
          throw new Error(`Missing center ID for ${centerName}`);
        }

        return {
          activityReportId: report.id,
          centerId
        };
      })
    ),
    fetchExisting: () =>
      prisma.activityReportCenter.findMany({
        where: {
          activityReportId: {
            in: activityReportIds
          }
        },
        select: {
          activityReportId: true,
          centerId: true
        }
      }),
    clear: () =>
      prisma.activityReportCenter.deleteMany({
        where: {
          activityReportId: {
            in: activityReportIds
          }
        }
      }),
    createMany: (pairs) =>
      prisma.activityReportCenter.createMany({
        data: pairs,
        skipDuplicates: true
      }),
    pairKey: (pair) => `${pair.activityReportId}:${pair.centerId}`
  });

  await syncRelationSet({
    label: "support project centers",
    desiredPairs: demoSupportProjects.flatMap((project) =>
      project.centerNames.map((centerName) => {
        const centerId = centerIdByName.get(centerName);

        if (!centerId) {
          throw new Error(`Missing center ID for ${centerName}`);
        }

        return {
          supportProjectId: project.id,
          centerId
        };
      })
    ),
    fetchExisting: () =>
      prisma.supportProjectCenter.findMany({
        where: {
          supportProjectId: {
            in: supportProjectIds
          }
        },
        select: {
          supportProjectId: true,
          centerId: true
        }
      }),
    clear: () =>
      prisma.supportProjectCenter.deleteMany({
        where: {
          supportProjectId: {
            in: supportProjectIds
          }
        }
      }),
    createMany: (pairs) =>
      prisma.supportProjectCenter.createMany({
        data: pairs,
        skipDuplicates: true
      }),
    pairKey: (pair) => `${pair.supportProjectId}:${pair.centerId}`
  });

  await syncRelationSet({
    label: "activity report projects",
    desiredPairs: demoActivityReports.flatMap((report) =>
      report.projectIds.map((supportProjectId) => ({
        activityReportId: report.id,
        supportProjectId
      }))
    ),
    fetchExisting: () =>
      prisma.activityReportProject.findMany({
        where: {
          activityReportId: {
            in: activityReportIds
          }
        },
        select: {
          activityReportId: true,
          supportProjectId: true
        }
      }),
    clear: () =>
      prisma.activityReportProject.deleteMany({
        where: {
          activityReportId: {
            in: activityReportIds
          }
        }
      }),
    createMany: (pairs) =>
      prisma.activityReportProject.createMany({
        data: pairs,
        skipDuplicates: true
      }),
    pairKey: (pair) => `${pair.activityReportId}:${pair.supportProjectId}`
  });
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
