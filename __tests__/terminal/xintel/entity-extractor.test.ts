import {
  extractTickers,
  extractMentions,
  extractWalletStrings,
  extractDomains,
  extractTelegramLinks,
  extractDiscordLinks,
  extractGitHubLinks,
  extractAllEntities,
} from '@/lib/terminal/xintel/entity-extractor';

describe('Entity Extractor', () => {
  describe('extractTickers', () => {
    it('extracts $TICKER patterns', () => {
      const text = 'Check out $BTC and $ETH, also $SOL is pumping!';
      const tickers = extractTickers(text);

      expect(tickers).toHaveLength(3);
      expect(tickers.map(t => t.ticker)).toContain('BTC');
      expect(tickers.map(t => t.ticker)).toContain('ETH');
      expect(tickers.map(t => t.ticker)).toContain('SOL');
    });

    it('counts multiple mentions of same ticker', () => {
      const text = '$BTC is great. I love $BTC. $BTC to the moon!';
      const tickers = extractTickers(text);

      expect(tickers).toHaveLength(1);
      expect(tickers[0].ticker).toBe('BTC');
      expect(tickers[0].count).toBe(3);
    });

    it('ignores invalid ticker formats', () => {
      const text = '$a $TOOLONGTICKERHERE $ $123';
      const tickers = extractTickers(text);

      expect(tickers).toHaveLength(0);
    });
  });

  describe('extractMentions', () => {
    it('extracts @handle patterns', () => {
      const text = 'Hey @alice and @bob_123, check this out! cc @charlie';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(3);
      expect(mentions.map(m => m.handle)).toContain('alice');
      expect(mentions.map(m => m.handle)).toContain('bob_123');
      expect(mentions.map(m => m.handle)).toContain('charlie');
    });

    it('counts multiple mentions', () => {
      const text = '@alice @bob @alice @alice';
      const mentions = extractMentions(text);

      const alice = mentions.find(m => m.handle === 'alice');
      expect(alice?.count).toBe(3);
    });
  });

  describe('extractWalletStrings', () => {
    it('extracts Solana addresses', () => {
      const text = 'Send to 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      const wallets = extractWalletStrings(text);

      expect(wallets).toHaveLength(1);
      expect(wallets[0].chain).toBe('solana');
    });

    it('extracts EVM addresses', () => {
      const text = 'Contract: 0x1234567890abcdef1234567890abcdef12345678';
      const wallets = extractWalletStrings(text);

      expect(wallets).toHaveLength(1);
      expect(wallets[0].chain).toBe('ethereum');
    });
  });

  describe('extractDomains', () => {
    it('extracts domains from URLs', () => {
      const text = 'Check out https://example.com and https://test.xyz';
      const domains = extractDomains(text);

      expect(domains).toHaveLength(2);
      expect(domains.map(d => d.value)).toContain('example.com');
      expect(domains.map(d => d.value)).toContain('test.xyz');
    });

    it('filters common social domains', () => {
      const text = 'Follow me on https://twitter.com/user and https://youtube.com/channel';
      const domains = extractDomains(text);

      expect(domains).toHaveLength(0);
    });
  });

  describe('extractTelegramLinks', () => {
    it('extracts t.me links', () => {
      const text = 'Join us at https://t.me/cryptogroup and t.me/anothergroup';
      const links = extractTelegramLinks(text);

      expect(links).toHaveLength(2);
      expect(links.map(l => l.value)).toContain('cryptogroup');
      expect(links.map(l => l.value)).toContain('anothergroup');
    });
  });

  describe('extractDiscordLinks', () => {
    it('extracts discord.gg links', () => {
      const text = 'Join discord.gg/abc123 or https://discord.com/invite/xyz789';
      const links = extractDiscordLinks(text);

      expect(links).toHaveLength(2);
    });
  });

  describe('extractGitHubLinks', () => {
    it('extracts GitHub repository links', () => {
      const text = 'Check the code at https://github.com/user/repo';
      const links = extractGitHubLinks(text);

      expect(links).toHaveLength(1);
      expect(links[0].value).toBe('user/repo');
    });
  });

  describe('extractAllEntities', () => {
    it('extracts all entity types from multiple texts', () => {
      const texts = [
        '$BTC is pumping! Check https://example.com',
        'Join t.me/cryptogroup @alice @bob',
        'Contract: 0x1234567890abcdef1234567890abcdef12345678',
      ];

      const result = extractAllEntities(texts);

      expect(result.tickers).toHaveLength(1);
      expect(result.domains).toHaveLength(1);
      expect(result.telegram).toHaveLength(1);
      expect(result.mentions).toHaveLength(2);
      expect(result.wallets).toHaveLength(1);
    });
  });
});
