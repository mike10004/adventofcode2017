describe('basic test', () => {
    it('says something', () => {
        const actual = new Promenade().go('world');
        expect(actual).toEqual('Hello world');
    });
});
