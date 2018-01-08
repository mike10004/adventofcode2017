const structures = require('../common/structures');
const {Position, Grid, Virus, PartTwoVirus, INFECTED, NORTH, EAST, SOUTH, WEST, RIGHT, LEFT, IDENTITY, REVERSE} = require('./sporifica');
const assert = require('assert');
const util = require('util');

describe('Offset', () => {

    const testCases = [
        [NORTH, RIGHT, EAST, "NORTH-RIGHT"],
        [EAST, RIGHT, SOUTH, "EAST-RIGHT"],
        [SOUTH, RIGHT, WEST, "SOUTH-RIGHT"], 
        [WEST, RIGHT, NORTH, "WEST-RIGHT"],
        [NORTH, LEFT, WEST, "NORTH-LEFT"],
        [EAST, LEFT, NORTH, "EAST-LEFT"],
        [SOUTH, LEFT, EAST, "SOUTH-LEFT"],
        [WEST, LEFT, SOUTH, "WEST-LEFT"],
        [NORTH, IDENTITY, NORTH, "NORTH-IDENTITY"],
        [EAST, IDENTITY, EAST, "EAST-IDENTITY"],
        [SOUTH, IDENTITY, SOUTH, "SOUTH-IDENTITY"],
        [WEST, IDENTITY, WEST, "WEST-IDENTITY"],
        [NORTH, REVERSE, SOUTH, "NORTH-REVERSE"],
        [EAST, REVERSE, WEST, "EAST-REVERSE"],
        [SOUTH, REVERSE, NORTH, "SOUTH-REVERSE"],
        [WEST, REVERSE, EAST, "WEST-REVERSE"],
    ];
    testCases.forEach(tc => {
        const initial = tc[0], turn = tc[1], expected = tc[2], desc = tc[3];
        it(util.format("%s %s %s", initial, turn, desc), () => {
            const actual = initial.turn(turn);
            assert.deepStrictEqual(actual, expected);
        })
    })

})

describe('../common/structures.Table', () => {
    it('keys', () => {
        const t = new structures.Table();
        t.put(3, 4, 'x');
        const rowKeys = t.rowKeys();
        rowKeys.forEach(k => {
            assert.equal(typeof k, 'number');
        })
    })
})

describe('Grid', () => {
    const text = '..#\n' + 
                 '#..\n' + 
                 '...';
    
    it('parse', () => {
        const grid = Grid.parse(text);
        const expected = '. . #\n# . .\n. . .';
        console.log(util.format("expecting\n%s\n\nactual\n%s\n", expected, grid.render()));
        const infecteds = [new Position(1, 1), new Position(0, -1)];
        infecteds.forEach(p => {
            assert.equal(grid.isInfected(p), true, "expect infected at " + p.toString());
        });
        const uninfecteds = [
            new Position(-1, -1),
            new Position(-1, 0),
            new Position(-1, 1),
            new Position(0, 1),
            new Position(0, 0),
            new Position(1, -1),
            new Position(1, 0),
        ];
        uninfecteds.forEach(p => {
            assert.equal(grid.isInfected(p), false, "expect not infected at " + p.toString());
        });
    })
    it('count filterless', () => {
        const grid = Grid.parse(text);
        assert.equal(grid.count(), 9);
    })
    it('count string filter', () => {
        const grid = Grid.parse(text);
        assert.equal(grid.count(INFECTED), 2);
    })
    it('count function filter', () => {
        const grid = Grid.parse(text);
        assert.equal(grid.count(ch => ch === INFECTED), 2);
    })
    it('render virus', () => {
        const grid = Grid.parse(text);
        const rendering = grid.render(new Virus());
        console.log(rendering);
        assert.equal(rendering, " . . # \n #[.]. \n . . . ");
    })
    it('render virus even', () => {
        const grid = Grid.parse(text);
        const virus = new Virus(new Position(0, -1));
        const rendering = grid.render(virus, -2, 2, -2, 2);
        console.log(rendering);
        assert.equal(rendering, " . . . . . \n . . . # . \n .[#]. . . \n . . . . . \n . . . . . ");
    })
    it('isInfected', () => {
        const grid = Grid.parse(text);
        grid.dump();
        assert.equal(grid.isInfected(new Position(1, 1)), true, "-1, 1 = true");
        assert.equal(grid.isInfected(new Position(0, -1)), true, "0, -1 = true");
        assert.equal(grid.isInfected(new Position(0, 0)), false, "0, 0 = false");
        assert.equal(grid.isInfected(new Position(-1, 0)), false, "0, 0 = false");
        assert.equal(grid.isInfected(new Position(2, 0)), false, "2, 0 = false");
    })
})

describe('Virus', () => {
    it('turns', () => {
        const text = '..#\n#..\n...';
        const virus = new Virus();
        const grid = Grid.parse(text);
        let result;
        console.log(util.format("%s\n%s\n", result, grid.render(virus)));
        assert.deepEqual(virus.position, new Position(0, 0));
        result = virus.move(grid);
        console.log(util.format("%s\n%s\n", result, grid.render(virus)));
        assert.equal(result.turn, LEFT);
        assert.deepEqual(virus.direction, WEST, "direction");
        assert.deepEqual(virus.position, new Position(0, -1));
        result = virus.move(grid);
        console.log(util.format("%s\n%s\n", result, grid.render(virus)));
        assert.equal(result.turn, RIGHT);
        assert.deepEqual(virus.direction, NORTH, "direction");
        assert.deepEqual(virus.position, new Position(1, -1));
        result = virus.move(grid);
        console.log(util.format("%s\n%s\n", result, grid.render(virus)));
        assert.equal(result.turn, LEFT);
        assert.deepEqual(virus.direction, WEST, "direction");
        assert.deepEqual(virus.position, new Position(1, -2));
    });
    function doInfectionTest(VirusType, moves, expectedInfections) {
        it(util.format("%s move() x %d", VirusType.name, moves), () => {
            const text = '..#\n#..\n...';
            const virus = new VirusType();
            const grid = Grid.parse(text);
            for (let i = 0; i < moves; i++) {
                virus.move(grid);
            }
            assert.equal(virus.numInfections, expectedInfections);    
        });
    }
    [
        [Virus, 7, 5],
        [Virus, 70, 41],
        [Virus, 10000, 5587],
        [PartTwoVirus, 100, 26],
    ].forEach(testCase => {
        const VirusType = testCase[0], moves = testCase[1], expectedInfections = testCase[2];
        doInfectionTest(VirusType, moves, expectedInfections);
    })
});
