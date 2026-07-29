cytoscape.use(cytoscapeDagre);

async function start() {

    const response = await fetch("mythology.json");
    const data = await response.json();

    const nodes = data.characters.map(character => ({
        data: {
            id: character.id,
            label: character.name,
            type: character.type
        }
    }));
    const edges = [];

data.characters.forEach(character => {

    if (!character.parents) return;

    character.parents.forEach(parent => {

        edges.push({
            data: {
                id: `${parent}-${character.id}`,
                source: parent,
                target: character.id
            }
        });

    });

});

    const cy = cytoscape({
        container: document.getElementById("cy"),

        elements: [
    ...nodes,
    ...edges
],

        style: [
    {
        selector: "node",
        style: {
            "label": "data(label)",
            "text-wrap": "wrap",
            "text-max-width": 120,

            "shape": "round-rectangle",

            "width": 160,
            "height": 70,

            "background-color": "#F7F3E8",

            "border-width": 2,
            "border-color": "#B89B5E",

            "color": "#2B2B2B",

            "font-size": 18,
            "font-weight": "bold",

            "text-valign": "center",
            "text-halign": "center"
        }
    }
    ,{
    selector: "edge",
    style: {
        "curve-style": "bezier",
        "width": 2,
        "line-color": "#999",
        "target-arrow-shape": "none"
    }
}
],

        layout: {
    name: "dagre",
    rankDir: "TB",
    nodeSep: 50,
    rankSep: 120
}
    });

}

start();