const {
    computeGridWidth, 
    makeGrid,
    findRegions,
    getSampleGrid,
    padLeft
} = require('./defrag');

function gridArrayToRows(grid, gridWidth) {
    gridWidth = gridWidth || computeGridWidth(grid);
    const rows = [];
    let row = [];
    for (let i = 0; i < grid.length; i++) {
        row.push(grid[i]);
        if ((i + 1) % gridWidth === 0) {
            rows.push(row);
            row = [];
        }
    }
    return rows;
}

function demoFindRegions(arrayOfGridOrKey){
    arrayOfGridOrKey.forEach(gridOrKey => {
        let grid = gridOrKey;
        if (!Array.isArray(grid)) {
            grid = makeGrid(gridOrKey);
        }
        const regions = findRegions(grid);
        const regionsByName = new Map();
        const nameByIndex = new Map();
        let n = 0;
        let longestNameLength = 0;
        for (let region of regions) {
            let name = '#';
            if (region.size > 1) {
                name = n.toString(32);
                regionsByName.set(name, region);
                if (name.length > longestNameLength) {
                    longestNameLength = name.length;
                }
            }
            for (let index of region) {
                nameByIndex.set(index, name);
            }
            n++;
        }
        const labeled = grid.map((value, index) => {
            let label = '.';
            if (nameByIndex.has(index)) {
                label = nameByIndex.get(index);
            }
            return padLeft(label, longestNameLength + 1, ' ');
        });
        const rendered = gridArrayToRows(labeled).map(row => row.join('')).join("\n");
        console.log(rendered);
    });
}

demoFindRegions([
    getSampleGrid(),
     'flqrgnkx',
]);

