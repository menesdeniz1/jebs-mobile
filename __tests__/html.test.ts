import { escapeHtml } from '../lib/html';

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes greater-than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it('handles all special chars at once', () => {
    expect(escapeHtml('<div class="x">&\'test\'')).toBe(
      '&lt;div class=&quot;x&quot;&gt;&amp;&#x27;test&#x27;'
    );
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    // @ts-expect-error testing runtime safety
    expect(escapeHtml(null)).toBe('');
    // @ts-expect-error testing runtime safety
    expect(escapeHtml(undefined)).toBe('');
  });

  it('passes through safe strings unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });

  it('handles Turkish characters correctly', () => {
    expect(escapeHtml('Şüpheli & Mağdur')).toBe('Şüpheli &amp; Mağdur');
  });
});
