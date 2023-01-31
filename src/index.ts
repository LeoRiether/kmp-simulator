import "./index.scss";
import { element, text_node } from './element';

class KMP {
    pattern: string;
    alive: Set<number>;

    constructor(pattern: string) {
        this.pattern = pattern;
        this.alive = new Set([0]);
    }

    advance(c: string) {
        let alive = new Set([0]);

        this.alive.forEach(i => {
            if (c == this.pattern[i])
                alive.add(i + 1);
        });

        this.alive = alive;
        return alive;
    }

    create_svg(): HTMLElement {
        const pattern = this.pattern;
        const alive = this.alive;

        const width = document.documentElement.clientWidth;
        const radius = Math.min(32, (width - 10) / (4 * pattern.length + 4));
        const arrow_width = 2 * radius;
        const height = 5 * radius;

        let svg = element("svg", {
            "width": width,
            "height": height,
            "xmlns": "http://www.w3.org/2000/svg",
        });

        const offset = (width - 4 * radius - 4 * pattern.length * radius) / 2 - 10;
        const node_x = (index: number) => index * (2 * radius + arrow_width) + 2 * radius + offset;
        const node_y = height - radius - 3;
        const node = (index: number, final: boolean) => {
            let x = node_x(index);
            let circle = element("circle", {
                "cx": x,
                "cy": node_y,
                "r": radius,
                "fill": alive.has(index) ? "red" : "white",
                "stroke": "black",
                "stroke-width": "2",
            });

            if (final) {
                let smaller = circle.cloneNode(true) as HTMLElement;
                smaller.setAttribute("r", (radius * 0.8).toString());

                let frag = document.createDocumentFragment();
                frag.appendChild(circle);
                frag.appendChild(smaller);
                return frag;
            }

            return circle;
        };

        const arrow = (i: number) =>
            element("path", {
                "d": `M ${node_x(i) + radius} ${node_y} l ${arrow_width} 0 l -13 -7 m 13 7 l -13 7`,
                "stroke": "black",
                "stroke-width": "2",
                "fill": "none",
            });

        const text = (i: number, s: string) =>
            element("text", {
                "x": (node_x(i) + node_x(i + 1)) / 2 - 4,
                "y": node_y * 0.95,
                "fill": "black",
                "text-anchor": "middle",
            }, [text_node(s)]);

        const loop = () => {
            const x0 = node_x(0) - radius * 0.9;
            const x1 = node_x(0) + radius * 0.9;
            const y = node_y - radius - 2;
            const high_y = y - 1.2 * radius;
            let arrow = element("path", {
                "d": `M ${x0} ${y} Q ${x0 - 10} ${high_y}, ${(x0 + x1) / 2} ${high_y} Q ${x1 + 10} ${high_y}, ${x1} ${y} l -5 -6 m 5 6 l 6 -4`,
                "fill": "none",
                "stroke": "black",
                "stroke-width": "2",
            });

            let sigma = element("text", {
                "x": node_x(0),
                "y": node_y - 2.5 * radius,
                "fill": "black",
                "text-anchor": "middle",
            }, [text_node('Σ')]);

            let frag = document.createDocumentFragment();
            frag.appendChild(arrow);
            frag.appendChild(sigma);
            return frag;
        }

        svg.appendChild(loop());
        for (let i = 0; i <= pattern.length; i++) {
            svg.appendChild(node(i, i == pattern.length));
            if (i < pattern.length) {
                svg.appendChild(arrow(i));
                svg.appendChild(text(i, pattern[i]));
            }
        }

        return svg;
    }
}

// Query elements
const pattern_input = document.getElementById("pattern")! as HTMLInputElement;
const char_input = document.getElementById("input-char")! as HTMLInputElement;
const svg_wrapper = document.getElementById("automaton")! as HTMLDivElement;

let kmp = new KMP("abacaba");
pattern_input.value = "abacaba";

function create_svg() {
    let svg = kmp.create_svg();
    svg_wrapper.replaceChildren(svg);

    // https://stackoverflow.com/a/13654655
    svg_wrapper.innerHTML = svg_wrapper.innerHTML;
}

// Bind events
function on_pattern_input() {
    kmp = new KMP(pattern_input.value);
    create_svg();
}
pattern_input.addEventListener('input', on_pattern_input);
on_pattern_input(); // initializes empty automaton

function on_char_input() {
    let c = char_input.value;
    char_input.value = "";

    kmp.advance(c);
    create_svg();
};
char_input.addEventListener('input', on_char_input);
