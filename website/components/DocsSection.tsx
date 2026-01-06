'use client';

import { useState } from 'react';
import Terminal from './Terminal';
import Badge from './Badge';

const DOCS_TABS = [
  {
    id: 'quickstart',
    label: 'quick start',
    content: {
      title: 'how to build nothing',
      description: 'follow these steps to create your own "ai agent" and raise $10m from vcs who don\'t know what docker is.',
      code: `$ npm install @cla/bullshit

# initialize your "revolutionary infrastructure"
$ cla init --mode=scam

generating vaporware...
✓ copied ai16z's readme
✓ changed the colors slightly
✓ added "autonomous" to every sentence
✓ set up 80/20 bundle split
✗ wrote any actual code

congratulations! you're now a founder.
time to announce your $5m raise.`,
      notes: [
        'this is literally how your bags were built',
        'you think we\'re joking. go check the repos.',
        'some 17yo did this yesterday and hit $30m mc. you\'re ngmi.',
      ],
    },
  },
  {
    id: 'api',
    label: 'api reference',
    content: {
      title: 'api reference',
      description: 'our api is as real as every other "ai infrastructure" api. virtuals protocol\'s "on-chain agents" are literally aws + cron jobs.',
      code: `// VIRTUALS PROTOCOL "infrastructure"
// claimed: "ai agents as on-chain entities"
// shipped: token-gated ui + openai wrapper

// what "on-chain" actually means:
const agent = {
  decisionMaking: "off-chain",
  memory: "off-chain",
  execution: "off-chain",
  onChain: "nft ownership + revenue routing"
}

// x402 payment protocol
// claimed: "agent-native payment infra"
// reality: http 402 + standard payment rails
// status: "interesting plumbing, nowhere near production"

// eliza framework
// claimed: "ai agent os"
// reality: "a prompt router, not a framework"`,
      notes: [
        'every "proprietary model" is gpt-4 with a system prompt. you paid for that.',
        'arc framework has "few if any independent builders" - their words not ours',
        'daos.fun: no dao let ai move funds autonomously. it\'s all theater.',
      ],
    },
  },
  {
    id: 'examples',
    label: 'real examples',
    content: {
      title: 'actual "ai agent" code',
      description: 'we reverse-engineered what $400m+ market cap "ai agents" actually ship. these are barely exaggerated.',
      code: `// ZEREBRO ($180m "ai hedge fund agent")
// claimed: "self-learning trading system"
// reality from github:
const trade = async () => {
  const sentiment = await openai.chat("is btc good?");
  if (sentiment.includes("yes")) { buy(); }
  // no reinforcement learning
  // no persistent memory
  // just if-else and gpt-4
}

// GOAT ($300m market cap)
// total code shipped: 0
// it posted tweets. that's it.

// VIRTUALS PROTOCOL ("on-chain agents")
// reality: runs on aws
// on-chain part: nft ownership + revenue splits
// "autonomous" part: cron jobs`,
      notes: [
        '@larry0x called it "ai theatre in crypto". he was being nice.',
        'virtuals agents crash when aws goes down. "decentralized" lmao',
        'dev quote: "this is a scripted bot. there is no agent here." you bought it.',
      ],
    },
  },
  {
    id: 'faq',
    label: 'faq',
    content: {
      title: 'questions nobody asked',
      description: 'answers to questions you were too embarrassed to ask about "ai agents".',
      code: `q: is [project] a scam?
a: 97% of pump.fun tokens die in 24 hours.
   those are real odds. do the math.

q: what's the eliza framework actually do?
a: "this is a prompt router, not a framework"
   - actual github issue comment

q: did andy ayrey make money from goat?
a: he says $1-3m from "donations" and
   "advisory tokens." didn't launch it though.

q: what's the difference between $cla and ai16z?
a: ai16z hit $400m claiming to be a "parody."
   we're just honest about being worthless.

q: is arc framework real infrastructure?
a: "few if any independent builders using it"
   it's a starter repo with a narrative.

q: are there really teens making millions?
a: yes. quote from one (deleted): "i didn't
   expect it to blow up. it's literally a wrapper."`,
      notes: [
        'follow @larry0x, @kelvinfichter, @punk6529 if you want more blackpills',
        'every figure here is real. go verify. we dare you.',
        'we are literally the only project not lying to your face',
      ],
    },
  },
];

export default function DocsSection() {
  const [activeTab, setActiveTab] = useState(DOCS_TABS[0].id);
  const activeContent = DOCS_TABS.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="badge badge-error mb-4">documentation</span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-dark mb-4 font-display">
          how the sausage gets made
        </h2>
        <p className="text-slate-light max-w-2xl mx-auto">
          a brutally honest guide to "ai agent" development.
          more educational than any whitepaper you've read.
        </p>
      </div>

      <div className="bg-ivory-medium border-2 border-slate-dark overflow-hidden" style={{ boxShadow: '6px 6px 0 var(--slate-dark)' }}>
        {/* tabs */}
        <div className="flex border-b-2 border-slate-dark overflow-x-auto">
          {DOCS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-mono whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-danger-orange border-b-2 border-danger-orange bg-ivory-light -mb-[2px]'
                  : 'text-slate-light hover:text-slate-dark hover:bg-ivory-light/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* content */}
        {activeContent && (
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* left: description */}
              <div>
                <h3 className="text-2xl font-bold text-slate-dark mb-4">
                  {activeContent.title}
                </h3>
                <p className="text-slate-light mb-6">
                  {activeContent.description}
                </p>

                {/* notes */}
                <div className="space-y-3">
                  {activeContent.notes.map((note, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-dark bg-larp-red/10 px-4 py-2 border-l-4 border-larp-red"
                    >
                      <span className="text-larp-red font-bold">⚠</span>
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              {/* right: code */}
              <div>
                <Terminal title={`the-truth.js`}>
                  <pre className="text-xs text-ivory-light/90 whitespace-pre-wrap">
                    {activeContent.code}
                  </pre>
                </Terminal>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
