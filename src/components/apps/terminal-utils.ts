import { FileSystemItem } from '../../types/os';

export const resolveNode = (currentFs: FileSystemItem, pathArr: string[]): FileSystemItem | null => {
    let current = currentFs;
    if (pathArr.length === 0) return null;
    if (pathArr[0] !== current.id) return null;

    for (let i = 1; i < pathArr.length; i++) {
        const nextId = pathArr[i];
        const found = current.children?.find(c => c.id === nextId);
        if (found) current = found;
        else return null;
    }
    return current;
};

export const calculatePathDisplay = (fileSystem: FileSystemItem, currentPath: string[]): string => {
    let currentNode = fileSystem;
    const resolvedNames: string[] = [];

    if (currentPath.length > 0 && currentPath[0] === fileSystem.id) {
        resolvedNames.push('home');
    } else {
        resolvedNames.push('?');
    }

    for (let i = 1; i < currentPath.length; i++) {
        const nextId = currentPath[i];
        const child = currentNode.children?.find(c => c.id === nextId);
        if (child) {
            resolvedNames.push(child.name);
            currentNode = child;
        } else {
            resolvedNames.push(nextId);
        }
    }

    let pathStr = '/' + resolvedNames.join('/');
    return pathStr.replace('/home', '/home/kadir');
};
