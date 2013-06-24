require("chai").should();

describe("test", function() {

    it("should return false for others", function() {
        var foo = 'bar';
        var fo1 = [];
        foo.should.be.a('string');
        foo.should.not.equal('badr');
        foo.should.have.length(3);
        foo.should.include('b');
        ({
            foo: 1,
            bar: 2
        }).should.have.keys(['foo', 'bar']);
    });

});