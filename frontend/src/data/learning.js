export const LESSONS = [
  {
    slug: 'budgeting-101',
    title: 'Budgeting basics',
    emoji: '💵',
    tag: 'Budgeting',
    accent: 'brand',
    summary: 'What a budget actually is, and how to build one in ten minutes.',
    readTime: '4 min',
    sections: [
      {
        heading: 'What is a budget?',
        body: [
          'A budget is a plan for your money before you spend it. It answers three questions: what is coming in, what must go out, and what is left over for your goals.',
          'It is not a punishment and it is not a restriction on fun. A budget is how you decide in advance what matters, so the month does not decide for you.',
        ],
      },
      {
        heading: 'The simplest method: 50/30/20',
        body: ['Take your after-tax income and split it into three pots.'],
        list: [
          '50% needs — rent, transport, food, data, electricity, school fees',
          '30% wants — takeaways, streaming, outings, airtime extras',
          '20% savings, extra debt repayments and goals',
        ],
        note: 'If 50% does not cover your rent alone, do not force the ratio. Use it as a compass, not a rule.',
      },
      {
        heading: 'Building your first budget',
        body: ['Four steps, in this order:'],
        list: [
          'Write down your total income for the month, from every source.',
          'List fixed costs first — the ones that do not negotiate (rent, transport, data).',
          'Assign a limit to every remaining category.',
          'Check your spending weekly and adjust before month end, not after.',
        ],
      },
      {
        heading: 'South African costs people forget',
        body: [
          'Municipal accounts, prepaid electricity, funeral contributions, stokvel contributions, school uniforms, and money sent to family are the costs that most often break a budget here.',
          'Put them in your budget as their own lines. If they are invisible, they will always look like overspending.',
        ],
      },
    ],
    takeaways: [
      'A budget is a plan you make before the month starts.',
      '50/30/20 is a starting point, not a law.',
      'Fixed and family costs deserve their own budget lines.',
    ],
  },
  {
    slug: 'banking-basics',
    title: 'Banking and fees',
    emoji: '🏦',
    tag: 'Banking',
    accent: 'brand',
    summary: 'Accounts, fees and how to stop paying for things you do not use.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Types of accounts',
        body: [
          'A transaction account is for everyday spending — salary in, bills out. A savings account earns interest and keeps money separate from your spending. A fixed deposit locks money away for a set period at a higher rate.',
          'Most young South Africans only need one good transaction account and one savings account to start.',
        ],
      },
      {
        heading: 'The real cost of fees',
        body: [
          'Monthly account fees, cash withdrawal fees, card swipes, instant transfers and SMS alerts add up quietly. A R50 monthly fee plus a few small charges per transaction can cost more than R1,000 a year.',
          'Bank fees are one of the few expenses you can cut completely without cutting your quality of life.',
        ],
        list: [
          'Check the monthly fee and whether you qualify for a zero-fee or youth account.',
          'Prefer EFT and card swipes over cash withdrawals.',
          'Turn off notifications you do not read, but keep fraud alerts on.',
          'Compare your fee against your balance — a costly account with a small balance rarely makes sense.',
        ],
      },
      {
        heading: 'Digital banks and wallets',
        body: [
          'Digital-only banks often charge lower fees and give better budgeting tools. Mobile wallets and merchant apps are useful for split bills and quick payments.',
          'Whatever you use: never share your one-time pin, and keep your card and phone PINs different and hard to guess.',
        ],
      },
      {
        heading: 'Protecting your money',
        body: [
          'Set transaction limits, enable transaction notifications, and check your statements weekly. If your card is lost, freeze it in the app immediately — most banks let you do this in seconds.',
        ],
      },
    ],
    takeaways: [
      'Fees compound quietly — review them twice a year.',
      'Keep spending and savings in separate accounts.',
      'Never share a one-time pin, for any reason.',
    ],
  },
  {
    slug: 'credit-and-interest',
    title: 'Credit and interest',
    emoji: '💳',
    tag: 'Credit',
    accent: 'gold',
    summary: 'What credit really costs, and how a credit score is built.',
    readTime: '5 min',
    sections: [
      {
        heading: 'What is credit?',
        body: [
          'Credit is borrowed money that you must repay, usually with interest. It can be useful — a car you need for work, a course that raises your earning power — but it always costs more than paying cash.',
          'The question is never "can I afford the instalment?" It is "does this debt improve my financial position enough to justify the cost?"',
        ],
      },
      {
        heading: 'How interest works',
        body: [
          'Interest is the price of borrowing, quoted as an annual percentage. Interest compounds, which means you pay interest on unpaid interest.',
          'Example: R10,000 at 15% a year costs roughly R1,250 in the first year alone if you make no repayments. The longer you take to repay, the more of your money goes to the lender instead of you.',
        ],
        list: [
          'Always compare the total repayment, not just the monthly instalment.',
          'Pay more than the minimum whenever you can.',
          'Clear the highest interest debt first.',
        ],
      },
      {
        heading: 'Your credit score',
        body: [
          'A credit score (roughly 300 to 850 in South Africa) summarises how you have handled credit. Lenders use it to decide whether to lend to you and at what rate.',
        ],
        list: [
          'Pays it up: pay on time, every time — this is the single biggest factor.',
          'Keeps balances low: stay under about 30% of your credit limits.',
          'Does not chase credit: many applications in a short period look risky.',
          'Checks records: request your report annually and dispute errors.',
        ],
      },
      {
        heading: 'Good debt vs bad debt',
        body: [
          'Good debt builds an asset or raises your income — a study loan, a reasonable car loan for a job you need.',
          'Bad debt funds consumption that loses value: clothing accounts, finance on the latest phone, or rolling a loan into another loan.',
          'Store cards often carry very high rates. The "50% off today" deal is rarely worth the interest you will pay.',
        ],
      },
    ],
    takeaways: [
      'Interest compounds — time is the real cost of debt.',
      'Pay on time to protect your credit score.',
      'Compare total repayment, never just the instalment.',
    ],
  },
  {
    slug: 'saving-essentials',
    title: 'Saving and emergency funds',
    emoji: '💰',
    tag: 'Saving',
    accent: 'brand',
    summary: 'How to build a buffer that stops small surprises becoming debt.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Saving vs investing',
        body: [
          'Saving means setting money aside somewhere safe and accessible, for a goal or an emergency. The balance stays steady.',
          'Investing means buying assets that can grow over time, accepting that the value can fall in the short term. It suits money you will not need for five years or more.',
        ],
      },
      {
        heading: 'The emergency fund',
        body: [
          'An emergency fund is money reserved for genuine surprises: a medical bill, a phone repair, a month with less work. Without one, every surprise becomes debt.',
          'The target is three to six months of essential expenses, but nobody starts there.',
        ],
        list: [
          'First R1,000 — a mini buffer for small surprises.',
          'Then one month of essentials.',
          'Then work towards three months.',
        ],
        note: 'Keep it in a separate account you cannot reach with a single tap.',
      },
      {
        heading: 'How to actually save',
        body: [
          'Motivation fades; systems do not. The most reliable method is to move money on the day you are paid, before you spend anything.',
          'Even R100 a month matters more than an occasional R1,000 — because consistency is what trains the habit.',
        ],
        list: [
          'Automate a transfer on pay day.',
          'Round up purchases into savings where your bank offers it.',
          'Keep goal money separate from everyday money.',
          'Increase the amount whenever your income rises.',
        ],
      },
      {
        heading: 'Savings goals',
        body: [
          'A goal needs a target, a date, an honest current balance and a monthly contribution. Without a date, a goal is only a wish.',
          'Start with something reachable in three to six months so you experience completing a goal early.',
        ],
      },
    ],
    takeaways: [
      'Save first on pay day, not from what is left.',
      'Emergency fund target: three months of essentials.',
      'A goal without a date is a wish.',
    ],
  },
  {
    slug: 'investing-101',
    title: 'Investing basics',
    emoji: '📈',
    tag: 'Investing',
    accent: 'gold',
    summary: 'What investing is, what the risks are, and where beginners start.',
    readTime: '5 min',
    sections: [
      {
        heading: 'Why people invest',
        body: [
          'Inflation quietly reduces what your money buys over time. Investing is how money earns money, so that the money you do not spend today buys more later.',
          'The trade-off is risk: the same growth potential means values can fall in the short term.',
        ],
      },
      {
        heading: 'Main asset classes',
        body: ['Four broad categories cover almost everything a beginner will meet.'],
        list: [
          'Shares — a piece of a company. Higher growth potential, higher volatility.',
          'Bonds — lending money to a government or company for interest. Steadier, lower return.',
          'Property — buying physical property or funds that hold it.',
          'Cash — savings and money market funds. Lowest risk, lowest return.',
        ],
      },
      {
        heading: 'Where South African beginners start',
        body: [
          'A tax-free savings account lets you invest up to R36,000 a year and R500,000 in your lifetime, with no tax on growth or withdrawals. It is the cheapest, simplest wrapper for long-term investing.',
          'A retirement annuity offers tax deductions on contributions. Beyond that, exchange traded funds and index funds spread your money across many companies at once, which reduces the risk of betting on one.',
        ],
        note: 'Only invest money you will not need for at least five years.',
      },
      {
        heading: 'Rules that protect beginners',
        body: [
          'If someone promises high, fixed returns with no risk, walk away — that is the classic scam profile.',
          'Diversify: never put all your money in one share, one person, or one scheme.',
          'Invest regularly with small amounts rather than trying to time the market.',
          'Check that whoever sells to you is registered with the Financial Sector Conduct Authority.',
        ],
      },
    ],
    takeaways: [
      'Investing beats inflation over long periods, at the cost of short-term swings.',
      'Use tax-free savings accounts and diversified funds first.',
      'Guaranteed high returns with no risk = scam.',
    ],
  },
  {
    slug: 'spotting-scams',
    title: 'Spotting financial scams',
    emoji: '🚨',
    tag: 'Scams',
    accent: 'risk',
    summary: 'The warning signs of fraud, and what to do when it happens.',
    readTime: '4 min',
    sections: [
      {
        heading: 'How scams work',
        body: [
          'Scams almost always create urgency or excitement: a limited-time prize, an urgent account problem, or a once-off investment window. The goal is to stop you thinking.',
          'They also isolate you — asking you to move to WhatsApp, to keep it quiet, or to pay before speaking to anyone.',
        ],
      },
      {
        heading: 'Common scams in South Africa',
        list: [
          'Fake SARS or bank messages with a link asking you to "verify" your account.',
          'Advance-fee loans that require an "insurance" or "activation" payment first.',
          'Offers to buy items from your card, or to "share" your account for a fee.',
          'Investment or crypto schemes guaranteeing fixed high returns.',
          'Romance contacts who quickly introduce a money or investment opportunity.',
          'Job adverts that ask you to pay for training, uniforms or onboarding.',
        ],
      },
      {
        heading: 'The five-second check',
        body: ['Before you tap, pay or share anything:'],
        list: [
          'Did I expect this message?',
          'Am I being rushed?',
          'Am I being asked for a pin, password or one-time pin?',
          'Is the sender\'s number or email the official one?',
          'Does it promise returns that sound unrealistic?',
        ],
        note: 'No legitimate bank, employer or government department will ever ask for your one-time pin.',
      },
      {
        heading: 'If it happens to you',
        body: [
          'Contact your bank immediately and ask them to freeze the card or reverse the transaction. Report it to the SAPS and keep the reference number.',
          'Change your passwords and PINs, and monitor your statements for the next few months. Reporting quickly is what protects your money.',
        ],
      },
    ],
    takeaways: [
      'Urgency plus secrecy is the scammer\'s core playbook.',
      'Never share a one-time pin, ever.',
      'Call your bank first — speed determines whether you get your money back.',
    ],
  },
  {
    slug: 'loans-and-repayments',
    title: 'Loans and repayments',
    emoji: '🏠',
    tag: 'Loans',
    accent: 'gold',
    summary: 'Instalments, total cost, and how to repay debt faster.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Before you sign',
        body: [
          'A loan is a long commitment. The monthly instalment is the number lenders advertise; the total repayment is the number that matters.',
          'Ask for the total cost of credit, the interest rate, all fees, and what happens if you pay late.',
        ],
        list: [
          'Can I still cover my essentials if income drops next month?',
          'Is the instalment under 15% of my monthly income?',
          'Am I borrowing for something that holds its value?',
        ],
      },
      {
        heading: 'How to repay faster',
        body: [
          'Paying a little extra each month cuts interest dramatically, because extra payments reduce the balance that interest is calculated on.',
          'Keep paying the minimum on every debt, and direct all extra cash at the most expensive one first — the debt avalanche method.',
        ],
      },
      {
        heading: 'Warning signs of debt stress',
        body: ['Catch these early — they get harder to fix over time.'],
        list: [
          'Paying only the interest, or rolling a loan into another loan.',
          'Using one credit card to pay another.',
          'Missing due dates or getting settlement letters.',
          'Debt repayments above 15% of income.',
        ],
      },
      {
        heading: 'Where to get help',
        body: [
          'If repayments become unmanageable, contact your credit provider early — restructuring is cheaper than a judgment against you.',
          'South Africa has free debt counselling services registered with the National Credit Regulator. A debt counsellor can negotiate a manageable repayment plan.',
        ],
      },
    ],
    takeaways: [
      'Compare total repayment, not the instalment.',
      'Keep repayments under 15% of income.',
      'Ask for help before you miss payments.',
    ],
  },
]

export const QUIZ = [
  {
    id: 'q1',
    question: 'You earn R8,000 and your total expenses are R6,500. What does that mean?',
    options: [
      'You have R1,500 left over this month',
      'You should increase your expenses',
      'Your budget has failed',
      'You must invest all of it immediately',
    ],
    answer: 0,
    explain: 'R8,000 − R6,500 = R1,500 surplus. That is money you can direct to savings or a goal.',
  },
  {
    id: 'q2',
    question: 'What is an emergency fund for?',
    options: [
      'A holiday you have been planning',
      'Unexpected costs so you do not borrow',
      'Showing friends you have savings',
      'Paying your normal monthly bills',
    ],
    answer: 1,
    explain: 'It covers genuine surprises — a repair, medical bill or lost income — so a surprise never becomes debt.',
  },
  {
    id: 'q3',
    question: 'Which debt should you pay extra on first?',
    options: [
      'The one with the highest interest rate',
      'The one with the smallest balance',
      'The newest one',
      'Whichever is closest to being paid off',
    ],
    answer: 0,
    explain: 'The highest interest rate costs you the most per rand, so clearing it first saves the most money.',
  },
  {
    id: 'q4',
    question: 'A message says you have won a prize and must click a link and enter your PIN to claim it. What do you do?',
    options: [
      'Enter the PIN quickly before it expires',
      'Delete it and report it as fraud',
      'Forward it to friends to check',
      'Reply asking if it is real',
    ],
    answer: 1,
    explain: 'Legitimate prizes never need your PIN. Delete, report, and verify on an official number.',
  },
  {
    id: 'q5',
    question: 'Which of these is the best sign that a savings goal is realistic?',
    options: [
      'It has a target amount and a date',
      'It is the biggest amount you can imagine',
      'Your friends are doing the same one',
      'You only decide once you get the money',
    ],
    answer: 0,
    explain: 'Target + date + monthly contribution turns a wish into a plan you can track.',
  },
  {
    id: 'q6',
    question: 'What does interest on a loan actually cost you?',
    options: [
      'Nothing if you pay on time',
      'The price of borrowing, added over time',
      'Only a once-off admin fee',
      'It is set by the government',
    ],
    answer: 1,
    explain: 'Interest is the price of borrowing, and it compounds — so the longer you take, the more you pay.',
  },
]
