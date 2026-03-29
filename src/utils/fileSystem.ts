import { FileSystemItem } from '../types/os';

/**
 * Recursively finds a node in the file system tree by its ID.
 * @param node The root node or current node to search from.
 * @param id The ID of the node to find.
 * @returns The found FileSystemItem or null if not found.
 */
export const findNode = (node: FileSystemItem, id: string): FileSystemItem | null => {
    if (node.id === id) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNode(child, id);
            if (found) return found;
        }
    }
    return null;
};
