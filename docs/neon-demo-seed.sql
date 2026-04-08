-- Neon SQL Editor 用デモ seed
-- 前提:
-- 1. migration 適用済み
-- 2. bootstrap seed 済みで admin ユーザーが存在する
-- 3. loginId = 'admin' の管理者を updatedBy / createdBy に利用する

BEGIN;

DO $seed$
DECLARE
  admin_id TEXT;
BEGIN
  SELECT "id" INTO admin_id
  FROM "User"
  WHERE "loginId" = 'admin'
  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user with loginId=admin was not found. Run bootstrap seed first.';
  END IF;

  INSERT INTO "SitePage" (
    "id", "pageKey", "title", "body", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES (
    'seed-sitepage-about-terms',
    'ABOUT_TERMS'::"SitePageKey",
    'サイトについて・利用規約',
    '本サイトは技術協力会が運用する会員企業向けポータルサイトです。学校公式サイトではありません。利用者はログインのうえ、会員向け情報の閲覧、企業情報の更新、技術シーズの登録を行えます。',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT ("pageKey") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "body" = EXCLUDED."body",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "Center" (
    "id", "centerName", "domain", "summary", "mainActivities", "companyRelation",
    "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
    ('seed-center-system-innovation', 'システムイノベーションセンター', '教育連携', '教育連携を通じて、高専と会員企業の接点を広げるセンターです。', '授業連携、PBL、共同企画、技術人材育成', '教育プログラムへの協力、学生との接点づくり、共同テーマ検討', admin_id, admin_id, NOW(), NOW()),
    ('seed-center-open-solution', 'オープンソリューションセンター', '研究連携', '研究連携を軸に、高専の技術シーズと企業課題をつなぐセンターです。', '共同研究、技術相談、実証実験、技術移転支援', '研究テーマ相談、共同研究立ち上げ、技術課題の持ち込み', admin_id, admin_id, NOW(), NOW()),
    ('seed-center-community-link', '地域連携推進センター', '就職・生涯学習', '地域企業との連携、就職支援、生涯学習支援を担うセンターです。', 'インターンシップ、キャリア連携、公開講座、地域課題連携', '採用連携、地域課題プロジェクト、社会人学び直し企画', admin_id, admin_id, NOW(), NOW())
  ON CONFLICT ("centerName") DO UPDATE
  SET
    "domain" = EXCLUDED."domain",
    "summary" = EXCLUDED."summary",
    "mainActivities" = EXCLUDED."mainActivities",
    "companyRelation" = EXCLUDED."companyRelation",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "Company" (
    "id", "companyName", "industry", "address", "businessSummary",
    "interestTheme", "contactInfo", "isActive", "createdAt", "updatedAt"
  )
  VALUES
    ('demo-company-hokuriku-sensing', '北陸センシング株式会社', 'IoT機器・制御設計', '新潟県長岡市深沢町2085-16', '製造現場向けのセンシング端末、制御盤、データ収集ユニットを企画・開発しています。
既設設備への後付け導入を得意としており、現場で使い続けられる堅牢性を重視した設計を行っています。', '学生との試作開発、設備データの可視化、現場実証を見据えた共同研究に関心があります。
少量多品種の組立工程で役立つセンシングテーマを高専と一緒に深めたいと考えています。', 'demo+hokuriku-sensing@example.com', TRUE, NOW(), NOW()),
    ('demo-company-nagaoka-foodlab', '長岡フードラボ株式会社', '食品製造・品質管理', '新潟県長岡市摂田屋4-8-12', '発酵食品と地域素材を活用した加工食品の製造を行っています。
温度管理や外観検査の標準化を進めながら、小ロットでも品質を安定させる仕組みづくりに取り組んでいます。', '食品加工工程の見える化、品質評価、異物混入防止、包装検査の自動化に関心があります。
学生実習や現場見学と連動したテーマ設定も歓迎しています。', 'demo+nagaoka-foodlab@example.com', TRUE, NOW(), NOW()),
    ('demo-company-echigo-polymer', '越後ポリマー技研株式会社', '樹脂成形・材料開発', '新潟県見附市今町7-3-2', '樹脂成形品の試作、機能性材料の選定、治具部材の設計支援を行っています。
小ロット開発案件が多く、量産前評価と試作品の短納期対応に強みがあります。', '再生材活用、軽量化、耐薬品性評価、成形条件の最適化に関する連携を希望しています。
実験データの蓄積や評価観点の整理を高専と一緒に進めたい考えです。', 'demo+echigo-polymer@example.com', TRUE, NOW(), NOW()),
    ('demo-company-shinanotech-energy', '信濃テックエナジー株式会社', '環境・エネルギー', '新潟県長岡市城内町3-5-6', '工場や公共施設向けの省エネ支援、蓄電池活用、設備更新提案を行っています。
地域のエネルギー利用を可視化し、脱炭素と運用改善を両立する提案型の案件を多く扱っています。', '排熱利用、蓄電池制御、需要予測、地域エネルギーマネジメントの共同検討に関心があります。
現場データを使った実証と学生参加型の分析テーマにも前向きです。', 'demo+shinanotech-energy@example.com', TRUE, NOW(), NOW()),
    ('demo-company-yukiguni-dx', '雪国デジタルソリューションズ株式会社', 'IT・DX支援', '新潟県長岡市大手通2-2-6', '地域製造業向けの業務アプリ開発、データ連携、帳票のデジタル化支援を行っています。
現場の運用定着を重視し、少人数のチームでも無理なく使えるシステム設計を得意としています。', '作業記録のデジタル化、技能伝承、生成AIを使わない軽量な業務支援、IoT連携基盤に関心があります。
教育現場と企業現場の両方で使えるツールづくりを目指しています。', 'demo+yukiguni-dx@example.com', TRUE, NOW(), NOW()),
    ('cm0memberdemo00000000000000', 'サンプル工業株式会社', '精密加工・試作開発', '新潟県長岡市新産2-1-5', '精密加工、試作治具製作、装置部品の短納期対応を行う会員企業です。
研究試作と現場改善の両方に対応しており、加工ノウハウを生かした共同検討を進めています。', '共同研究、インターンシップ、外観検査、省力化設備の試作に関心があります。
学生の設計提案を現場検証につなげる取り組みも歓迎しています。', 'demo+sample-kogyo@example.com', TRUE, NOW(), NOW())
  ON CONFLICT ("id") DO UPDATE
  SET
    "companyName" = EXCLUDED."companyName",
    "industry" = EXCLUDED."industry",
    "address" = EXCLUDED."address",
    "businessSummary" = EXCLUDED."businessSummary",
    "interestTheme" = EXCLUDED."interestTheme",
    "contactInfo" = EXCLUDED."contactInfo",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

  INSERT INTO "User" (
    "id", "loginId", "email", "passwordHash", "userName", "role", "companyId",
    "status", "mustChangePassword", "createdAt", "updatedAt"
  )
  VALUES (
    'seed-user-member-demo',
    'member-demo',
    'member-demo@example.com',
    '$2a$10$.GGtPewUE3Od38YvXJWuruI/SiDxe24Wy4NJaSqc1dt35rUOiqciW',
    '会員デモ担当',
    'MEMBER'::"Role",
    'cm0memberdemo00000000000000',
    'ACTIVE'::"UserStatus",
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT ("loginId") DO UPDATE
  SET
    "email" = EXCLUDED."email",
    "passwordHash" = EXCLUDED."passwordHash",
    "userName" = EXCLUDED."userName",
    "role" = EXCLUDED."role",
    "companyId" = EXCLUDED."companyId",
    "status" = EXCLUDED."status",
    "mustChangePassword" = EXCLUDED."mustChangePassword",
    "updatedAt" = NOW();

  DELETE FROM "News"
  WHERE
    "id" NOT IN ('demo-news-briefing-materials', 'demo-news-pbl-showcase', 'demo-news-maintenance', 'demo-news-mini-expo', 'demo-news-kyodo-research-2026', 'demo-news-techseed-update')
    AND "title" = '会員向けポータルを公開しました'
    AND "category" = 'お知らせ'
    AND "body" = '技術協力会の会員企業向けポータルを公開しました。最新情報や支援プロジェクトを確認できます。'
    AND "createdBy" = admin_id;

  INSERT INTO "News" (
    "id", "title", "body", "category", "publishStatus", "publishedAt",
    "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
    ('demo-news-briefing-materials', '地域課題テーマ説明会の資料を掲載しました', '会員企業向けに実施した地域課題テーマ説明会の資料を掲載しました。
長岡高専との共同検討を始める際の進め方や、センターごとの相談窓口をまとめています。

新規テーマの相談前に確認しておくとスムーズな項目も整理していますので、活動報告や支援プロジェクトとあわせてご覧ください。', '制度案内', 'PUBLISHED'::"PublishStatus", '2026-01-29T00:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-news-pbl-showcase', '学生PBL成果共有会を開催しました', '会員企業との連携テーマを扱った学生PBLの成果共有会を開催しました。
加工治具、センシング、業務改善アプリなど複数分野の成果を紹介し、次年度テーマの検討も始まっています。

参加企業からのコメントを踏まえ、活動報告ページにも関連内容を順次掲載します。', '連携報告', 'PUBLISHED'::"PublishStatus", '2026-02-18T05:30:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-news-maintenance', 'ポータル保守作業のお知らせ（完了）', '会員向けポータルの保守作業を実施し、一覧画面と詳細画面の表示を改善しました。
現在は通常どおり利用できます。

本更新にあわせて、お知らせ、活動報告、技術シーズの表示内容も見直しています。', 'メンテナンス', 'PUBLISHED'::"PublishStatus", '2026-03-04T23:45:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-news-mini-expo', '会員企業向けミニ展示会の参加募集について', '技術協力会の会員企業向けに、技術シーズ紹介と試作品展示を中心としたミニ展示会を開催します。
出展希望企業は、自社の技術シーズや試作事例をポータル経由で共有いただけます。

展示内容の相談はオープンソリューションセンターまでお寄せください。', 'イベント案内', 'PUBLISHED'::"PublishStatus", '2026-03-20T01:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-news-kyodo-research-2026', '令和8年度 共同研究・技術相談の受付を開始します', '令和8年度の共同研究、技術相談、実証検討の受付を開始します。
研究連携だけでなく、教育連携や地域連携を含む相談も対象です。

まずは支援プロジェクトやセンター紹介を確認のうえ、関心の近いテーマからご相談ください。', '募集', 'PUBLISHED'::"PublishStatus", '2026-04-01T00:30:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-news-techseed-update', '技術シーズ掲載ページを更新しました', '会員企業の技術シーズを見つけやすくするため、掲載内容を拡充しました。
精密加工、食品品質管理、樹脂成形、エネルギー、業務DXなど、分野の異なるシーズを追加しています。

ホーム画面の更新情報からも新着シーズを確認できます。', '公開案内', 'PUBLISHED'::"PublishStatus", '2026-04-05T02:00:00.000Z', admin_id, admin_id, NOW(), NOW())
  ON CONFLICT ("id") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "body" = EXCLUDED."body",
    "category" = EXCLUDED."category",
    "publishStatus" = EXCLUDED."publishStatus",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "TechSeed" (
    "id", "companyId", "seedName", "seedSummary", "applicationField",
    "usageExample", "strength", "relatedResults", "collaborationTheme",
    "createdAt", "updatedAt"
  )
  VALUES
    ('demo-techseed-edge-sensing-terminal', 'demo-company-hokuriku-sensing', '既設設備向け低消費電力センシング端末', '既存設備に後付けできる小型センシング端末です。
振動、電流、温湿度など複数のセンサ入力を一台で扱え、配線工事を最小限に抑えながら稼働状況の見える化を始められます。', 'IoT・センシング', '工作機械や搬送設備の稼働監視、試験機の利用記録、研究設備の環境測定などに活用できます。
学内実験設備での検証や会員企業の実証導入を組み合わせた検討が可能です。', '既設機への後付け性、通信断時のローカル保存、少量からのカスタム実装に強みがあります。
導入初期は必要な項目だけを選び、段階的に計測点を増やせます。', '県内製造業でのポンプ設備監視、食品工場での冷却設備モニタリング、教育用実習機への装着検証の実績があります。', 'センシングデータの解析手法、異常兆候検知、低温環境での通信安定化に関する共同検討を希望しています。', NOW(), NOW()),
    ('demo-techseed-factory-dashboard', 'demo-company-hokuriku-sensing', '小規模工場向け設備稼働ダッシュボード基盤', 'センサデータと日報入力をまとめて見られる設備稼働ダッシュボード基盤です。
現場の担当者が日常運用で使える粒度に絞り、少人数の工場でも扱いやすい構成にしています。', 'データ可視化・設備管理', '設備停止時間の見える化、作業日報との照合、保全タイミングの検討、卒業研究でのラインデータ分析などに活用できます。', 'クラウドとオンプレミスのどちらにも展開しやすく、段階導入がしやすい点が特長です。
収集端末と表示画面を分離できるため、検証の自由度も高くなっています。', '部品加工ラインの稼働可視化、工場見学向けのモニタ表示、技術協力会イベントでのデモ展示に活用した実績があります。', '教育用途も含めた可視化指標の設計、UI改善、異常時通知ルールの検証を高専と進めたいと考えています。', NOW(), NOW()),
    ('demo-techseed-fermentation-monitor', 'demo-company-nagaoka-foodlab', '発酵食品向け温湿度・熟成データ可視化', '発酵工程の温湿度、熟成日数、検査記録を一体管理するためのデータ整理手法です。
作業者ごとの差を減らしながら、品質の再現性を高める運用を支援します。', '食品品質管理', 'みそ、漬物、発酵調味料の製造工程管理や、試作品ごとの比較評価、実習テーマでの発酵条件の見える化に使えます。', '紙記録からの移行がしやすく、既存運用を大きく変えずに工程データを蓄積できる点が強みです。', '少量製造ラインでの熟成条件比較、商品開発会議でのデータ共有、社内勉強会向けの品質レビュー資料作成に活用しています。', '品質評価指標の整理、発酵条件と官能評価の関係分析、工程ごとの注意点の可視化を共同で進めたいです。', NOW(), NOW()),
    ('demo-techseed-package-inspection', 'demo-company-nagaoka-foodlab', '画像による包装外観検査テンプレート', '袋詰め製品やラベル貼付後の包装状態を確認するための簡易外観検査テンプレートです。
照明条件と撮像位置を標準化し、小規模ラインでも導入しやすい構成にしています。', '画像検査・品質保証', '印字ずれ、ラベル傾き、シール不良、パッケージ表面の汚れ確認などの検査補助に利用できます。', '検査対象が変わっても設定変更がしやすく、教育用サンプルとしても扱いやすい点が特長です。
手検査と併用しながら段階導入できます。', '期間限定商品の包装確認、校内展示用サンプルの品質確認、工程改善会議での比較資料作成に活用しています。', '撮像条件の最適化、良否判定の基準整理、画像特徴量の比較などで高専との連携を希望しています。', NOW(), NOW()),
    ('demo-techseed-elastomer-prototype', 'demo-company-echigo-polymer', '高耐久エラストマー部材の試作評価', '繰り返し荷重や低温環境に配慮したエラストマー部材の試作評価ノウハウです。
使用環境を想定した材料選定と簡易試験を組み合わせ、初期段階の比較検討を進めやすくしています。', '材料評価・部材試作', '防振部材、シール材、把持部品、搬送設備向けの緩衝部材などの試作検討に活用できます。', '小ロットでも比較評価しやすく、樹脂・ゴム系の候補材料を短期間で絞り込める点が強みです。', '寒冷地向け装置部材、薬液ライン用パッキン、研究治具の柔軟部品の試作評価に対応した実績があります。', '材料劣化の見極め、簡易試験条件の設計、再生材混合時の物性比較を共同で進めたいです。', NOW(), NOW()),
    ('demo-techseed-resin-flow-support', 'demo-company-echigo-polymer', '小ロット向け樹脂流動シミュレーション支援', '試作前の初期検討に使いやすい、樹脂流動の簡易シミュレーション支援です。
金型形状の大きな見直し前に、流れやすさや偏肉の傾向を把握する用途を想定しています。', '樹脂成形・CAE', '試作品のゲート位置検討、薄肉部の充填確認、成形条件の比較、学生向け演習テーマのケーススタディに利用できます。', '初期の方向付けに必要な情報を短時間で整理でき、量産前の検討コストを抑えやすい点が特長です。', '治具部材の形状見直し、軽量化部品の試作前評価、企業内の成形勉強会資料作成に活用しています。', '材料データの整理、評価モデルの妥当性確認、成形不良の再現条件の検討を高専と進めたいです。', NOW(), NOW()),
    ('demo-techseed-waste-heat-recovery', 'demo-company-shinanotech-energy', '工場排熱の簡易回収ユニット設計', '乾燥炉やコンプレッサ周辺の低中温排熱を回収するための簡易ユニット設計案です。
既存設備に大きな手を入れず、予備調査と小規模実証から始めることを前提にしています。', '省エネ・熱利用', '工場の給湯予熱、乾燥工程の補助、冬季の作業環境改善、実証研究の検討材料として活用できます。', '導入前の概算評価がしやすく、現場条件に合わせて段階的に検討を進められる点が強みです。', '工場空調の補助検討、給湯負荷の平準化、施設見学会での省エネ事例紹介に活用した実績があります。', '排熱量の見積り、回収効率の評価、運用条件による効果変動の解析を共同で進めたいと考えています。', NOW(), NOW()),
    ('demo-techseed-battery-optimization', 'demo-company-shinanotech-energy', '地域拠点向け蓄電池運用最適化モデル', '小規模拠点の電力使用状況に合わせて、蓄電池の充放電タイミングを整理する運用モデルです。
再エネ導入や災害時利用も見据え、運用ルールを比較しやすい形にまとめています。', 'エネルギーマネジメント', '公共施設、研究棟、工場事務所などでのピークカット検討や、実証データを使った評価演習に利用できます。', '実測データが少ない段階でも検討を始めやすく、複数パターンの運用比較に向いています。', '施設更新計画時の比較検討、地域防災拠点の電源計画、会員企業向け勉強会でのシミュレーション紹介に活用しています。', '需要予測、再エネ併用時の運用評価、教育用途を含めた可視化手法の改善に関心があります。', NOW(), NOW()),
    ('demo-techseed-worklog-platform', 'demo-company-yukiguni-dx', '技能伝承向け作業ログ収集アプリ基盤', '紙や口頭で残りがちな作業記録を、無理なくデジタル化するための軽量アプリ基盤です。
現場で必要な情報だけを素早く残せるよう、操作項目を絞った構成にしています。', '業務DX・記録管理', '設備点検、試作手順、段取り替え、実験記録、インターンシップ中の作業振り返りなどに活用できます。', 'タブレットでも使いやすく、導入時に大規模な教育を要しない点が特長です。
既存のExcel管理とも段階的に連携できます。', '保守点検記録、現場改善活動の履歴管理、作業引継ぎメモの電子化に活用した実績があります。', '教育現場でも使える入力設計、作業分類の整理、分析に使いやすいデータ構造の検討を希望しています。', NOW(), NOW()),
    ('demo-techseed-estimate-process-link', 'demo-company-yukiguni-dx', '受託製造向け見積・工程データ連携', '見積作成時の条件と実際の工程データをつなげ、次回案件に生かしやすくするための連携設計です。
属人的になりやすい見積根拠を整理し、案件振り返りをしやすくします。', '見積支援・工程最適化', '試作案件の見積精度向上、工数実績の蓄積、案件レビュー、学生の業務改善提案テーマに活用できます。', '既存システムを置き換えずに始めやすく、必要項目だけを段階的に連携できる点が強みです。', '個別受注製品の案件レビュー、工程会議でのデータ共有、原価見直しの検討資料として利用しています。', '入力負荷を増やさない設計、見積根拠の分析、工数ばらつき要因の整理を共同で進めたいです。', NOW(), NOW()),
    ('demo-techseed-thin-aluminum', 'cm0memberdemo00000000000000', '薄肉アルミ筐体の高精度試作加工', '薄肉アルミ筐体を短納期で試作するための加工ノウハウです。
変形を抑える工程設計と治具構成を組み合わせ、試作段階での精度確保を重視しています。', '精密加工・試作', 'センサ筐体、計測機器ケース、実験装置の外装、学生プロジェクトの試作部品などに活用できます。', '加工条件の調整幅が広く、設計変更への追従がしやすい点が強みです。
試作治具も含めて短納期で検討できます。', '検査装置カバー、教育用ロボット筐体、展示会向け試作品の製作で活用した実績があります。', '薄肉部の振動抑制、治具最適化、加工後測定の効率化に関する共同検討を希望しています。', NOW(), NOW()),
    ('demo-techseed-smart-jig-sensor', 'cm0memberdemo00000000000000', '切削加工ライン向け治具内蔵センサユニット', '加工治具に荷重や接触状態を検知するセンサを組み込むためのユニット構成です。
作業者の勘に頼りやすい段取り確認を、簡易な信号で補助できるよう設計しています。', '加工治具・センシング', '段取り確認、ワーク着座チェック、加工条件の評価、実習テーマでの治具改善検討に活用できます。', '既存治具に組み込みやすく、比較的低コストで試せる点が特長です。
加工現場の実情に合わせたカスタム調整にも対応できます。', '着座不良の検知補助、試作品評価のログ取得、現場改善提案のデモ機として利用した実績があります。', '信号処理の簡素化、耐切粉性の改善、治具設計との一体最適化を高専と進めたいです。', NOW(), NOW()),
    ('demo-techseed-visual-inspection-stage', 'cm0memberdemo00000000000000', '現場設備向け後付け外観検査ステージ', '小型部品や加工面を撮像しやすくする後付け型の外観検査ステージです。
照明と位置決めを簡易に標準化し、目視検査のばらつきを減らす用途を想定しています。', '外観検査・省力化', '加工傷確認、印字確認、組立前の部材チェック、教育展示用の画像検査デモに使えます。', '既存設備の近くに置いて使える省スペース設計で、試作評価から始めやすい点が強みです。', 'アルミ部品の表面確認、樹脂部材の外観比較、会員企業向け見学会での検査デモ展示に活用しました。', '撮像条件の最適化、判定アルゴリズムの比較、検査治具の改良に関する共同検討を希望しています。', NOW(), NOW())
  ON CONFLICT ("id") DO UPDATE
  SET
    "companyId" = EXCLUDED."companyId",
    "seedName" = EXCLUDED."seedName",
    "seedSummary" = EXCLUDED."seedSummary",
    "applicationField" = EXCLUDED."applicationField",
    "usageExample" = EXCLUDED."usageExample",
    "strength" = EXCLUDED."strength",
    "relatedResults" = EXCLUDED."relatedResults",
    "collaborationTheme" = EXCLUDED."collaborationTheme",
    "updatedAt" = NOW();

  INSERT INTO "SupportProject" (
    "id", "projectName", "summary", "background", "issue", "goal",
    "supportNeeded", "expectedResult", "contactInfo", "publishStatus",
    "publishedAt", "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
    ('demo-project-resin-reuse', '再生材を活用した樹脂部材評価プロジェクト', '再生材の活用可能性を探りながら、地域企業で使いやすい評価手順を整理するプロジェクトです。', '環境配慮の観点から再生材の活用ニーズが高まる一方で、小ロット試作の段階では評価手順が属人的になりやすい状況があります。
県内企業からも、量産前に比較検討しやすい枠組みを求める声が上がっています。', '材料ごとのばらつきや耐久性の見極めに時間がかかり、試作判断の根拠が共有しにくい点が課題です。', '再生材を含む候補材料を比較し、用途別に確認すべき評価観点を整理します。
会員企業が初期検討で使える実践的なチェック項目の整備を目指します。', '材料評価、簡易試験条件の設計、比較結果の見える化、試作形状の整理に協力いただける企業を募集しています。', '再生材検討の初期判断に使える評価テンプレートと、会員企業間で共有しやすい検討事例の蓄積を想定しています。', 'オープンソリューションセンター / demo-projects@example.com', 'PUBLISHED'::"PublishStatus", '2026-02-10T01:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-project-food-quality', '食品加工ラインの品質記録標準化プロジェクト', '食品加工工程の品質記録を標準化し、現場負荷を増やさずに改善につなげる取り組みです。', '小規模な食品製造現場では、品質記録が紙と口頭確認に分散しやすく、改善履歴の振り返りに時間がかかっています。
地域素材を扱う会員企業からも、工程条件の見える化に関する相談が増えています。', '温湿度、外観確認、作業条件の記録形式が揃わず、検証時に比較しづらい点が課題です。', '工程ごとに必要な記録項目を整理し、品質確認と改善検討の両方に使える記録テンプレートを整備します。', '食品製造、画像検査、データ整理、現場導入支援の知見を持つ企業と一緒に、現場で回る記録方法を検討したいと考えています。', '品質記録の標準化案と、工程改善に使えるサンプルデータを蓄積し、会員企業向けの共有事例として展開します。', '地域連携推進センター / demo-projects@example.com', 'PUBLISHED'::"PublishStatus", '2026-02-24T04:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-project-smart-factory', '加工現場のスマートファクトリー小規模実証', '既設設備に後付けできるセンシングと可視化を組み合わせ、現場改善につなげる実証プロジェクトです。', '会員企業から、設備更新を伴わずに稼働状況を把握したいという相談が継続的に寄せられています。
教育面では、学生が現場課題を理解しながらデータ活用を学べる題材としても期待されています。', '設備や作業の停止要因が見えにくく、改善テーマの優先順位づけが難しい点が課題です。', 'センシング、日報、簡易ダッシュボードを組み合わせ、現場改善に使える最小構成を整理します。', 'センシング端末、治具設計、ダッシュボード作成、現場ヒアリングに協力できる企業を募集しています。', '複数業種に展開しやすい実証テンプレートと、教育連携にも使える課題設定例の整備を見込んでいます。', 'システムイノベーションセンター / demo-projects@example.com', 'PUBLISHED'::"PublishStatus", '2026-03-08T00:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-project-energy-visualization', '地域拠点のエネルギー可視化・運用改善プロジェクト', '施設の電力利用を可視化し、蓄電池や省エネ施策の運用改善につなげる実証プロジェクトです。', '公共施設や事業所では、設備更新だけでなく運用改善による省エネ効果の見える化が求められています。
地域の防災拠点としての活用も視野に入れた相談が増えています。', '需要の波や設備ごとの消費傾向が把握しづらく、改善施策の比較検討に時間がかかる点が課題です。', '計測データをもとに運用パターンを比較し、現実的な改善案と教育用の検討素材を整備します。', '計測設計、蓄電池運用、可視化画面、地域実証の調整に協力いただける企業と連携したいと考えています。', '小規模拠点向けのエネルギー見える化モデルと、共同研究テーマへ発展しやすい実証条件の整理を目指します。', '地域連携推進センター / demo-projects@example.com', 'PUBLISHED'::"PublishStatus", '2026-03-22T06:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-project-field-service-dx', '現場保守業務の記録DX支援プロジェクト', '点検や保守作業の記録をデジタル化し、技能継承と業務改善につなげるプロジェクトです。', '保守現場では、紙の点検票や口頭共有に依存する運用が残っており、引継ぎや振り返りに時間を要しています。
若手育成と記録の標準化を両立したいという相談が増えています。', '作業記録の粒度が揃わず、改善提案や教育資料に転用しにくい点が課題です。', '保守現場で使いやすい入力項目を整理し、教育連携にも活用できる記録DXの雛形を整備します。', '保守業務、業務アプリ、UI設計、現場ヒアリングの知見を持つ会員企業との連携を希望しています。', '記録フォーマット、入力画面の試作、改善効果を確認するための運用例をまとめる予定です。', 'システムイノベーションセンター / demo-projects@example.com', 'PUBLISHED'::"PublishStatus", '2026-04-03T01:30:00.000Z', admin_id, admin_id, NOW(), NOW())
  ON CONFLICT ("id") DO UPDATE
  SET
    "projectName" = EXCLUDED."projectName",
    "summary" = EXCLUDED."summary",
    "background" = EXCLUDED."background",
    "issue" = EXCLUDED."issue",
    "goal" = EXCLUDED."goal",
    "supportNeeded" = EXCLUDED."supportNeeded",
    "expectedResult" = EXCLUDED."expectedResult",
    "contactInfo" = EXCLUDED."contactInfo",
    "publishStatus" = EXCLUDED."publishStatus",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "ActivityReport" (
    "id", "title", "summary", "body", "category", "publishStatus",
    "publishedAt", "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
    ('demo-report-company-tour-career', '会員企業見学会とキャリア対話を実施しました', '地域企業の現場を学生が見学し、若手社員との対話を通じて働き方と技術の関わりを学ぶ機会を設けました。', '地域連携推進センターが中心となり、会員企業2社の見学会を実施しました。
製造現場での改善活動や、業務のデジタル化が現場でどのように使われているかを紹介いただきました。

後半は若手社員との対話時間を設け、就職後に必要となる視点や、現場で求められるコミュニケーションについて意見交換を行いました。
企業側からは、見学だけでなく改善テーマの持ち帰りにつながる企画にしたいという提案もあり、次年度企画の検討を始めています。', 'キャリア連携', 'PUBLISHED'::"PublishStatus", '2026-02-12T07:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-report-resin-material-meeting', '再生材評価に向けた材料比較ミーティングを開催', '再生材を含む樹脂材料の評価観点を整理するため、会員企業と教員で比較ミーティングを行いました。', 'オープンソリューションセンターが調整役となり、樹脂成形や材料評価に関わる会員企業と教員が集まりました。
用途ごとに重視すべき物性や、初期評価で見落としやすい観点を持ち寄り、試作前に確認したい項目を整理しました。

会議では、再生材の配合率だけでなく、使用環境を踏まえた簡易試験の条件設定が重要であることが共有されました。
今後は支援プロジェクトと連動し、比較しやすい評価テンプレートづくりを進めます。', '研究連携', 'PUBLISHED'::"PublishStatus", '2026-02-28T04:30:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-report-food-sensing-workshop', '食品加工現場の品質記録ワークショップを実施', '食品加工企業と高専側で、品質記録と工程見える化の実践課題を共有するワークショップを行いました。', '食品製造に携わる会員企業を交え、品質記録の標準化と見える化をテーマにワークショップを開催しました。
工程ごとの温湿度記録、包装確認、作業メモの残し方を洗い出し、無理なく続けられる記録粒度を議論しました。

参加者からは、現場負荷を増やさずに改善に使える記録方法が必要との意見が多く、画像検査の簡易活用にも関心が集まりました。
今後は支援プロジェクトに接続し、記録テンプレートと改善事例の整理を進めます。', '地域課題連携', 'PUBLISHED'::"PublishStatus", '2026-03-03T06:30:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-report-smart-factory-pbl', '加工現場の可視化をテーマにPBL成果発表を実施', 'センシング端末と簡易ダッシュボードを組み合わせ、加工現場の見える化を題材にしたPBL成果を共有しました。', 'システムイノベーションセンターとオープンソリューションセンターが連携し、会員企業の現場課題を題材にしたPBL成果発表を行いました。
学生チームは、設備停止要因の整理、治具側で取得できる情報、ダッシュボードに必要な表示項目を提案しました。

企業側からは、設備更新を伴わない小規模実証として始めやすい構成だという評価がありました。
今後は実証プロジェクトと接続し、現場導入時の計測項目と運用ルールをさらに詰めていきます。', '教育連携', 'PUBLISHED'::"PublishStatus", '2026-03-14T08:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-report-energy-visualization-poc', '地域拠点の電力可視化PoCを開始しました', '施設の電力利用を見える化するPoCを開始し、改善施策の比較に向けた計測項目を整理しました。', '地域連携推進センターとオープンソリューションセンターが連携し、地域拠点でのエネルギー可視化PoCを開始しました。
施設担当者との打ち合わせを通じ、日別・時間帯別の消費傾向と、蓄電池運用を検討する際に必要な指標を整理しています。

PoCでは、教育用途にも転用しやすいよう、計測項目と可視化画面を絞り込んでいます。
今後は会員企業の知見も取り入れ、需要変動を踏まえた改善パターンの比較につなげる予定です。', '実証実験', 'PUBLISHED'::"PublishStatus", '2026-03-27T02:00:00.000Z', admin_id, admin_id, NOW(), NOW()),
    ('demo-report-dx-logbook-trial', '保守作業ログのデジタル化試行を開始', '点検業務の記録をデジタル化する試行を始め、教育連携と現場改善の両面から評価を進めています。', 'システムイノベーションセンターと地域連携推進センターが中心となり、保守作業ログのデジタル化試行を開始しました。
会員企業の現場担当者と一緒に、入力項目を最小限にしながら振り返りに必要な情報を残せる形を検討しています。

学生側からは、入力しやすさと後から分析しやすい構造を両立させたいという提案がありました。
今後は教育用の演習テーマにも広げながら、実際の現場で使える記録DXの雛形に仕上げていく予定です。', '業務改善', 'PUBLISHED'::"PublishStatus", '2026-04-04T05:00:00.000Z', admin_id, admin_id, NOW(), NOW())
  ON CONFLICT ("id") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "summary" = EXCLUDED."summary",
    "body" = EXCLUDED."body",
    "category" = EXCLUDED."category",
    "publishStatus" = EXCLUDED."publishStatus",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  DELETE FROM "SupportProjectCenter"
  WHERE "supportProjectId" IN ('demo-project-resin-reuse', 'demo-project-food-quality', 'demo-project-smart-factory', 'demo-project-energy-visualization', 'demo-project-field-service-dx');

  INSERT INTO "SupportProjectCenter" (
    "id", "supportProjectId", "centerId"
  )
  VALUES
    ('demo-project-resin-reuse:オープンソリューションセンター', 'demo-project-resin-reuse', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-project-food-quality:オープンソリューションセンター', 'demo-project-food-quality', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-project-food-quality:地域連携推進センター', 'demo-project-food-quality', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター')),
    ('demo-project-smart-factory:システムイノベーションセンター', 'demo-project-smart-factory', (SELECT id FROM "Center" WHERE "centerName" = 'システムイノベーションセンター')),
    ('demo-project-smart-factory:オープンソリューションセンター', 'demo-project-smart-factory', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-project-energy-visualization:オープンソリューションセンター', 'demo-project-energy-visualization', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-project-energy-visualization:地域連携推進センター', 'demo-project-energy-visualization', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター')),
    ('demo-project-field-service-dx:システムイノベーションセンター', 'demo-project-field-service-dx', (SELECT id FROM "Center" WHERE "centerName" = 'システムイノベーションセンター')),
    ('demo-project-field-service-dx:地域連携推進センター', 'demo-project-field-service-dx', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター'))
  ON CONFLICT ("supportProjectId", "centerId") DO NOTHING;

  DELETE FROM "ActivityReportCenter"
  WHERE "activityReportId" IN ('demo-report-company-tour-career', 'demo-report-resin-material-meeting', 'demo-report-food-sensing-workshop', 'demo-report-smart-factory-pbl', 'demo-report-energy-visualization-poc', 'demo-report-dx-logbook-trial');

  INSERT INTO "ActivityReportCenter" (
    "id", "activityReportId", "centerId"
  )
  VALUES
    ('demo-report-company-tour-career:地域連携推進センター', 'demo-report-company-tour-career', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター')),
    ('demo-report-resin-material-meeting:オープンソリューションセンター', 'demo-report-resin-material-meeting', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-report-food-sensing-workshop:オープンソリューションセンター', 'demo-report-food-sensing-workshop', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-report-food-sensing-workshop:地域連携推進センター', 'demo-report-food-sensing-workshop', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター')),
    ('demo-report-smart-factory-pbl:システムイノベーションセンター', 'demo-report-smart-factory-pbl', (SELECT id FROM "Center" WHERE "centerName" = 'システムイノベーションセンター')),
    ('demo-report-smart-factory-pbl:オープンソリューションセンター', 'demo-report-smart-factory-pbl', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-report-energy-visualization-poc:オープンソリューションセンター', 'demo-report-energy-visualization-poc', (SELECT id FROM "Center" WHERE "centerName" = 'オープンソリューションセンター')),
    ('demo-report-energy-visualization-poc:地域連携推進センター', 'demo-report-energy-visualization-poc', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター')),
    ('demo-report-dx-logbook-trial:システムイノベーションセンター', 'demo-report-dx-logbook-trial', (SELECT id FROM "Center" WHERE "centerName" = 'システムイノベーションセンター')),
    ('demo-report-dx-logbook-trial:地域連携推進センター', 'demo-report-dx-logbook-trial', (SELECT id FROM "Center" WHERE "centerName" = '地域連携推進センター'))
  ON CONFLICT ("activityReportId", "centerId") DO NOTHING;

  DELETE FROM "ActivityReportProject"
  WHERE "activityReportId" IN ('demo-report-company-tour-career', 'demo-report-resin-material-meeting', 'demo-report-food-sensing-workshop', 'demo-report-smart-factory-pbl', 'demo-report-energy-visualization-poc', 'demo-report-dx-logbook-trial');

  INSERT INTO "ActivityReportProject" (
    "id", "activityReportId", "supportProjectId"
  )
  VALUES
    ('demo-report-resin-material-meeting:demo-project-resin-reuse', 'demo-report-resin-material-meeting', 'demo-project-resin-reuse'),
    ('demo-report-food-sensing-workshop:demo-project-food-quality', 'demo-report-food-sensing-workshop', 'demo-project-food-quality'),
    ('demo-report-smart-factory-pbl:demo-project-smart-factory', 'demo-report-smart-factory-pbl', 'demo-project-smart-factory'),
    ('demo-report-energy-visualization-poc:demo-project-energy-visualization', 'demo-report-energy-visualization-poc', 'demo-project-energy-visualization'),
    ('demo-report-dx-logbook-trial:demo-project-field-service-dx', 'demo-report-dx-logbook-trial', 'demo-project-field-service-dx')
  ON CONFLICT ("activityReportId", "supportProjectId") DO NOTHING;
END;
$seed$;

COMMIT;
