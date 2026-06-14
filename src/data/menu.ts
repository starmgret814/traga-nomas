export type Category = "Hamburguesas" | "Combos" | "Bebidas" | "Promociones";

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export type Badge = "POPULAR" | "TOP" | "NUEVO" | "SIGNATURE";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  badge?: Badge;
}

export const extras: Extra[] = [
  { id: "extra-cheese", name: "Queso extra", price: 15 },
  { id: "bacon", name: "Bacon", price: 25 },
  { id: "caramelized-onions", name: "Cebolla caramelizada", price: 15 },
  { id: "extra-sauce", name: "Salsa extra", price: 10 },
];

export const products: Product[] = [
  // Hamburguesas
  {
    id: "p1",
    name: "La Patrona",
    description:
      "Carne 200g, queso americano, lechuga, tomate, cebolla, pepinillos y salsa especial de la casa.",
    price: 89,
    category: "Hamburguesas",
    image: "/images/burger-1.png",
    badge: "POPULAR",
  },
  {
    id: "p2",
    name: "Salchipapa malcriada",
    description:
      "Dos carnes smash 120g c/u, doble queso americano fundido, cebolla crispy, pepinillos y salsa smash.",
    price: 119,
    category: "Hamburguesas",
    image: "/images/burger-2.png",
    badge: "TOP",
  },
  {
    id: "p3",
    name: "La Trans",
    description:
      "Carne 200g, triple bacon crujiente, queso cheddar, cebolla caramelizada, lechuga y jitomate.",
    price: 129,
    category: "Hamburguesas",
    image: "/images/burger-3.png",
    badge: "NUEVO",
  },
  {
    id: "p4",
    name: "La Golosa",
    description:
      "Nuestra burger signature: doble carne 150g c/u, triple queso, bacon, aguacate, jitomate y salsa secreta.",
    price: 159,
    category: "Hamburguesas",
    image: "/images/burger-4.png",
    badge: "SIGNATURE",
  },

  // Combos
  {
    id: "c1",
    name: "Combo Clásico",
    description: "La Clásica con papas a la francesa crujientes y refresco de 600ml.",
    price: 139,
    category: "Combos",
    image: "/images/food-combo.png",
    badge: "TOP",
  },
  {
    id: "c2",
    name: "Combo Doble Smash",
    description: "Doble Smash con papas curly y la bebida de tu elección.",
    price: 179,
    category: "Combos",
    image: "/images/food-combo.png",
  },
  {
    id: "c3",
    name: "Combo Bacon Brutal",
    description: "Bacon Brutal con papas gajo, aros de cebolla y refresco grande.",
    price: 189,
    category: "Combos",
    image: "/images/food-combo.png",
    badge: "NUEVO",
  },

  // Bebidas
  {
    id: "b1",
    name: "Malteada de Chocolate",
    description: "Malteada espesa y cremosa de chocolate coronada con crema batida.",
    price: 59,
    category: "Bebidas",
    image: "/images/food-shake.png",
    badge: "NUEVO",
  },
  {
    id: "b2",
    name: "Refresco 600ml",
    description: "Refresco bien frío, el acompañante perfecto.",
    price: 35,
    category: "Bebidas",
    image: "/images/food-soda.png",
  },
  {
    id: "b3",
    name: "Limonada de la Casa",
    description: "Limonada natural recién preparada con un toque de hierbabuena.",
    price: 45,
    category: "Bebidas",
    image: "/images/food-soda.png",
  },

  // Promociones
  {
    id: "pr1",
    name: "Martes 2x1 Clásicas",
    description: "Pedí una La Clásica y la segunda corre por nuestra cuenta. Solo los martes.",
    price: 89,
    category: "Promociones",
    image: "/images/la-clasica.png",
    badge: "POPULAR",
  },
  {
    id: "pr2",
    name: "Dúo Smash",
    description: "Dos Doble Smash + papas grandes para compartir. Sabor brutal en pareja.",
    price: 219,
    category: "Promociones",
    image: "/images/doble-smash.png",
    badge: "TOP",
  },
  {
    id: "pr3",
    name: "Combo Familiar",
    description: "4 hamburguesas a elegir, 2 papas grandes, aros de cebolla y 4 bebidas.",
    price: 499,
    category: "Promociones",
    image: "/images/la-traga-nomas.png",
    badge: "SIGNATURE",
  },
];

export const categories: Category[] = ["Hamburguesas", "Combos", "Bebidas", "Promociones"];

export interface Promo {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
}

export const promos: Promo[] = [
  {
    id: "promo-combo",
    tag: "Combo del momento",
    title: "Doble Smash + papas",
    description: "Nuestra signature con papas crujientes y bebida al mejor precio del día.",
    image: "/images/burger-1.webp",
  },
];
