interface IProps {
    [key: string]: any
}

export function element(tag: string, props: IProps = {}, children: HTMLElement[] = []) {
    let el = document.createElement(tag);
    for (let key in props)
        el.setAttribute(key, props[key]);
    for (let child of children)
        el.appendChild(child);
    return el;
}

export const text_node = document.createTextNode.bind(document);

