import { Node } from '@musicbird/xml-parser';
import { getChildren, analyse } from '../helpers';

const cursor: string[] = [];
const listNodes = [
    'masterbars',
    'masterbars.masterbar.xproperties',
    'masterbars.masterbar.directions',
    'masterbars.masterbar.fermatas',
    'mastertrack.automations',
    'mastertrack.rse.master',
    'mastertrack.rse.master.effect.automations',
    'tracks',
    'tracks.track.lyrics',
    'tracks.track.properties',
    'tracks.track.properties.property.items',
    'tracks.track.properties.property.items.item.diagram',
    'tracks.track.properties.property.items.item.diagram.fingering',
    'tracks.track.properties.property.items.item.chord',
    'tracks.track.rse.channelstrip.automations',
    'tracks.track.rse.effectchains',
    'tracks.track.rse.effectchains.effectchain.rail',
    'tracks.track.rse.pickups',
    'tracks.track.rse.bankchanges',
    'tracks.track.rse.bankchanges.bankchange.pickups',
    'bars',
    'bars.bar.xproperties',
    'beats',
    'beats.beat.properties',
    'beats.beat.xproperties',
    'beats.beat.lyrics',
    'rhythms',
    'voices',
    'notes',
    'notes.note.properties',
    'notes.note.xproperties'
];

const lowercaseNodes = [
    'tracks.track.properties.property.items.item.chord.keynote.attrs.accidental',
    'tracks.track.properties.property.items.item.chord.bassnote.attrs.accidental'
];

export function gpifReducer(xmlTree): any {
    return getChildren(xmlTree.root).reduce(defaultReducer, {});
}

///

function defaultReducer(res, node: Node): any {
    const path = cursor.push(node.name) && cursor.join('.');

    res[node.name] = mapNode(node, path);
    cursor.pop();

    return res;
}

function listReducer(res, node: Node, index): Array<any> {
    const path = cursor.push(node.name) && cursor.join('.');
    const data = mapNode(node, path, true);
    
    if (data) {
        if (typeof data == 'object') {
            data.node = node.name;
        }

        res[index] = data;
    }

    cursor.pop();

    return res;
}

///

function mapNode(node: Node, path, isListItem = false): any {
    const {value, attrs, children} = node;

    let temp;
    switch (true) {
        case (listNodes.includes(path)):
            temp = {
                items: getChildren(node).reduce(listReducer, [])
            };
            break;

        case (value !== undefined): {
            let newValue = value === null
                ? void 0
                : value;

            if (lowercaseNodes.includes(path)) {
                newValue = newValue ? newValue.toLowerCase() : void 0;
            }

            temp = isListItem
                ? { node: node.name, value: newValue }
                : newValue;

        } break;

        case Boolean(children):
            temp = children.reduce(defaultReducer, {});
            break;

        default: {
            temp = isListItem
                ? { node: node.name }
                : node.isSelfClosing ? true : '';
        }
    }

    if (attrs && Object.keys(attrs).length) {
        const newAttrs = mapAttrs(attrs, path);
        temp = typeof temp == 'object'
            ? { attrs: newAttrs, ...temp }
            : { attrs: newAttrs };
    }

    return temp;
}

function mapAttrs(attrs, path): any {
    return Object.keys(attrs).reduce(attrsReducer, {});

    ///

    function attrsReducer(result, key) {
        const currentPath = `${path}.attrs.${key}`;
        let value = attrs[key];

        if (lowercaseNodes.includes(currentPath)) {
            value = value.toLowerCase();
        }

        result[key] = value;

        return result;
    }
}
