import { Menu } from "../types";

export function buildMenuTree(flatMenus: Menu[]): Menu[] {
  const map = new Map();
  const tree: Menu[] = [];

  // Siapkan node object
  flatMenus.forEach((m) => {
    map.set(m.menu_id, { ...m, children: [] });
  });

  // Bangun tree
  flatMenus.forEach((m) => {
    const node = map.get(m.menu_id);

    if (m.parent_id === null) {
      tree.push(node); // Root menu
    } else {
      const parent = map.get(m.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return tree;
}
