import { Node } from '@musicbird/xml-parser';

export function getChildren(node: Node): Array<Node> {
    return node.children && node.children.length
        ? node.children
        : [];
}

///


export function analyse(node: Node): string {
   return node.name[node.name.length - 1] == 's'
       ? '+'
       : '';
}

//export function analyse(node: Node) {
//    const stats = getChildren(node).reduce(reduceStats, {});
//
//    return getDuplicates(stats);
//
//    ///
//
//    function reduceStats(stats, node) {
//        stats[node.name] = (stats[node.name] || 0) + 1;
//
//        return stats;
//    }
//
//    function getDuplicates(stats) {
//        return Object.keys(stats).filter(name => stats[name] > 1);
//    }
//}
