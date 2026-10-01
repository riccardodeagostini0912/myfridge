import type { ImageSourcePropType } from "react-native";

/**
 * Static seed data for the Recipes tab.
 * Ingredient `name` values are used as matching keys for Pantry/Groceries,
 * so keep them lowercase, singular, and consistent across recipes.
 */

export type Ingredient = {
  name: string;
  quantity: string;
  unit?: string;
};

export type Recipe = {
  id: string;
  title: string;
  summary: string;
  cookTimeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  image: ImageSourcePropType;
  ingredients: Ingredient[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: 'songpyeon',
    title: 'Songpyeon',
    summary: 'Half-moon rice cakes with a sweet sesame filling, traditionally enjoyed during Chuseok.',
    cookTimeMinutes: 40,
    difficulty: "Medium",
    servings: 4,
    image: require('../../assets/recipes/songpyeon.png'),
    ingredients: [
      { name: 'rice flour', quantity: '200', unit: 'g' },
      { name: 'sesame seeds', quantity: '3', unit: 'tbsp' },
      { name: 'sugar', quantity: '2', unit: 'tbsp' },
      { name: 'sesame oil', quantity: '1', unit: 'tsp' },
      { name: 'water', quantity: '120', unit: 'ml' },
    ],
    steps: [
      'Mix the rice flour with warm water until a soft dough forms.',
      'Mix the sesame seeds and sugar for the filling.',
      'Fill small pieces of dough and shape them into half moons.',
      'Steam until cooked, then lightly coat with sesame oil.',
    ],
  },
  {
    id: 'bulgogi',
    title: 'Bulgogi',
    summary: 'Tender marinated beef cooked with onion and mushrooms in a sweet-savory sauce.',
    cookTimeMinutes: 25,
    difficulty: "Easy",
    servings: 2,
    image: require('../../assets/recipes/bulgogi.png'),
    ingredients: [
      { name: 'beef', quantity: '300', unit: 'g' },
      { name: 'onion', quantity: '1', unit: '' },
      { name: 'mushroom', quantity: '100', unit: 'g' },
      { name: 'soy sauce', quantity: '3', unit: 'tbsp' },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp' },
      { name: 'sugar', quantity: '1', unit: 'tbsp' },
      { name: 'garlic', quantity: '2', unit: 'clove' },
    ],
    steps: [
      'Mix the soy sauce, sesame oil, sugar, and garlic.',
      'Add the beef and let it marinate briefly.',
      'Cook the beef with the onion and mushroom in a hot pan.',
      'Stir-fry until the beef is cooked through and serve.',
    ],
  },
  {
    id: 'hobakjeon',
    title: 'Hobakjeon',
    summary: 'Zucchini slices lightly coated in flour and egg, then pan-fried until golden.',
    cookTimeMinutes: 15,
    difficulty: "Easy",
    servings: 2,
    image: require('../../assets/recipes/hobakjeon.png'),
    ingredients: [
      { name: 'zucchini', quantity: '1', unit: '' },
      { name: 'egg', quantity: '2', unit: '' },
      { name: 'flour', quantity: '4', unit: 'tbsp' },
      { name: 'salt', quantity: '1', unit: 'pinch' },
      { name: 'cooking oil', quantity: '1', unit: 'tbsp' },
    ],
    steps: [
      'Slice the zucchini into thin rounds and season lightly with salt.',
      'Coat each slice in flour, then dip it in beaten egg.',
      'Heat cooking oil in a pan over medium heat.',
      'Pan-fry the zucchini until golden on both sides.',
    ],
  },
  {
    id: 'donggeurangttaeng',
    title: 'Donggeurangttaeng',
    summary: 'Small Korean meat patties made with beef, tofu, and finely chopped vegetables.',
    cookTimeMinutes: 25,
    difficulty: "Medium",
    servings: 3,
    image: require('../../assets/recipes/donggeurangttaeng.png'),
    ingredients: [
      { name: 'beef', quantity: '200', unit: 'g' },
      { name: 'tofu', quantity: '100', unit: 'g' },
      { name: 'egg', quantity: '2', unit: '' },
      { name: 'onion', quantity: '0.5', unit: '' },
      { name: 'carrot', quantity: '0.5', unit: '' },
      { name: 'flour', quantity: '4', unit: 'tbsp' },
      { name: 'salt', quantity: '1', unit: 'pinch' },
      { name: 'cooking oil', quantity: '1', unit: 'tbsp' },
    ],
    steps: [
      'Finely chop the onion and carrot and crumble the tofu.',
      'Mix the beef, tofu, vegetables, and one egg together.',
      'Shape the mixture into small round patties.',
      'Coat with flour and beaten egg, then pan-fry until cooked through.',
    ],
  },
  {
    id: 'spinach-namul',
    title: 'Spinach Namul',
    summary: 'A simple Korean side dish of spinach seasoned with sesame, soy sauce, and garlic.',
    cookTimeMinutes: 10,
    difficulty: "Easy",
    servings: 2,
    image: require('../../assets/recipes/spinach-namul.png'),
    ingredients: [
      { name: 'spinach', quantity: '200', unit: 'g' },
      { name: 'soy sauce', quantity: '1', unit: 'tbsp' },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp' },
      { name: 'garlic', quantity: '1', unit: 'clove' },
      { name: 'sesame seeds', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      'Blanch the spinach briefly in boiling water.',
      'Rinse it in cold water and squeeze out excess moisture.',
      'Mix with soy sauce, sesame oil, garlic, and sesame seeds.',
    ],
  },
  {
    id: 'japchae',
    title: 'Japchae',
    summary: 'Chewy glass noodles tossed with colorful vegetables and sesame-soy seasoning.',
    cookTimeMinutes: 30,
    difficulty: "Medium",
    servings: 2,
    image: require('../../assets/recipes/japchae.png'),
    ingredients: [
      { name: 'glass noodles', quantity: '150', unit: 'g' },
      { name: 'spinach', quantity: '100', unit: 'g' },
      { name: 'carrot', quantity: '1', unit: '' },
      { name: 'onion', quantity: '1', unit: '' },
      { name: 'mushroom', quantity: '100', unit: 'g' },
      { name: 'soy sauce', quantity: '2', unit: 'tbsp' },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp' },
      { name: 'sugar', quantity: '1', unit: 'tbsp' },
      { name: 'garlic', quantity: '1', unit: 'clove' },
    ],
    steps: [
      'Cook the glass noodles according to the package instructions and drain.',
      'Stir-fry the onion, carrot, mushroom, and spinach until just tender.',
      'Add the noodles, soy sauce, sesame oil, sugar, and garlic.',
      'Toss everything together until evenly seasoned and serve.',
    ],
  },
];
