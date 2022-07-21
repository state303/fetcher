export {}

describe('dummy-test-suite', () => {
    it('dummy-test-run', () => {
        expect('hello'.concat(' ').concat('world')).toBe('hello world');
    });
});