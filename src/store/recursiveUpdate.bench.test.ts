
import { describe, it, expect } from 'vitest';
import { useOSStore } from './useOSStore';
import { FileSystemItem } from '../types/os';

// Helper to generate a large tree
const generateTree = (depth: number, breadth: number, currentDepth = 0): FileSystemItem[] => {
    if (currentDepth >= depth) return [];

    const items: FileSystemItem[] = [];
    // Add folders
    for (let i = 0; i < breadth; i++) {
        const id = `folder-${currentDepth}-${i}-${Math.random()}`;
        items.push({
            id,
            name: `Folder ${currentDepth}-${i}`,
            type: 'folder',
            children: generateTree(depth, breadth, currentDepth + 1)
        });
    }
    // Add files
    for (let i = 0; i < breadth; i++) {
         const id = `file-${currentDepth}-${i}-${Math.random()}`;
         items.push({
            id,
            name: `File ${currentDepth}-${i}`,
            type: 'file',
            content: 'content'
         });
    }
    return items;
};

describe('Recursive Update Performance', () => {
    it('updates a deep node efficiently', () => {
        // Create a large tree
        // Depth 4, Breadth 8
        // L0: 1
        // L1: 16 (8 folders, 8 files)
        // L2: 8 * 16 = 128
        // L3: 8 * 128 = 1024
        // L4: 8 * 1024 = 8192
        // Total ~ 9000 nodes
        const rootChildren = generateTree(4, 8);
        const root: FileSystemItem = {
            id: 'root',
            name: 'Root',
            type: 'folder',
            children: rootChildren
        };

        useOSStore.setState({ fileSystem: root });

        // Pick a target deep in the tree (last child of last child...)
        let target = root;
        // Navigate down to the deepest folder
        while(target.children) {
            const folders = target.children.filter(c => c.type === 'folder');
            if (folders.length === 0) break;
            target = folders[folders.length - 1];
        }

        const targetId = target.id;

        const start = performance.now();
        useOSStore.getState().createItem(targetId, { name: 'New Item', type: 'file' });
        const end = performance.now();

        console.log(`[Baseline] createItem duration: ${(end - start).toFixed(4)}ms`);

        // Sanity check
        const newState = useOSStore.getState().fileSystem;

        const findNode = (node: FileSystemItem, id: string): FileSystemItem | null => {
            if (node.id === id) return node;
            if (node.children) {
                for (const child of node.children) {
                    const found = findNode(child, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const updatedTarget = findNode(newState, targetId);
        expect(updatedTarget?.children?.some(c => c.name === 'New Item')).toBe(true);

        // Verify that we are currently doing a full tree clone (inefficient)
        // Find a node that is NOT in the path of the update.
        // Since we updated 'target', which is deep in the tree.
        // Let's look at root.children[0] vs root.children[1].
        // Our 'target' selection logic went down the LAST child.
        // So root.children[0] should be untouched.

        const originalFirstChild = root.children![0];
        const newFirstChild = newState.children![0];

        // Currently, they are NOT the same instance
        // Once optimized, this should be toBe(originalFirstChild)
        if (originalFirstChild !== newFirstChild) {
            console.log("⚠️  Unchanged branches were cloned (Current Behavior)");
        } else {
            console.log("✅ Unchanged branches preserved (Optimized Behavior)");
        }
    });

    it('updates file content efficiently', () => {
        const rootChildren = generateTree(4, 5); // Smaller tree for speed
        const root: FileSystemItem = {
            id: 'root',
            name: 'Root',
            type: 'folder',
            children: rootChildren
        };
        useOSStore.setState({ fileSystem: root });

        // Find a file
        let targetFile: FileSystemItem | null = null;
        const findFile = (node: FileSystemItem) => {
             if (node.type === 'file') {
                 targetFile = node;
                 return;
             }
             if (node.children) node.children.forEach(findFile);
        };
        findFile(root);

        if (!targetFile) throw new Error("No file found");

        const oldRoot = useOSStore.getState().fileSystem;
        useOSStore.getState().updateFileContent(targetFile!.id, 'New Content');
        const newRoot = useOSStore.getState().fileSystem;

        // Check referential equality of unrelated branch
        // Assuming root has multiple children
        if (oldRoot.children!.length > 1) {
             // Find a child that does NOT contain the target file
             // This is tricky without knowing the path.
             // But usually index 0 vs index 1 works if target is deep.
             // Let's just check if ANY child is preserved.
             const preserved = oldRoot.children!.some((child, index) => child === newRoot.children![index]);
             if (preserved) {
                  console.log("✅ updateFileContent preserved unrelated branches");
             } else {
                  console.log("⚠️ updateFileContent cloned everything");
             }
             expect(preserved).toBe(true);
        }
    });
});
