export type Option = { id: string; name: string; price: number }

export type OptionGroup = {
  id: string
  name: string
  /** mínimo de escolhas (1 = obrigatório) */
  min: number
  /** máximo de escolhas (1 = escolha única) */
  max: number
  options: Option[]
}

export type Product = {
  id: string
  category: string
  name: string
  description: string
  price: number
  image: string
  badge?: 'Mais pedido' | 'Novo' | 'Vegetariano'
  groups?: OptionGroup[]
}

export const STORE = {
  name: 'Sabor da Casa',
  tagline: 'Hamburgueria & Pizzaria',
  whatsapp: '5549999271760',
  address: 'Av. Getúlio Vargas, 845 — Centro, Chapecó/SC',
  deliveryFee: 6,
  freeDeliveryFrom: 90,
  minOrder: 25,
  deliveryTime: '35–50 min',
  pickupTime: '20–25 min',
}

/** Horário por dia da semana (0 = domingo). Cada dia pode ter mais de um turno. */
export const HOURS: Record<number, [string, string][]> = {
  0: [['11:00', '15:00'], ['18:00', '23:30']],
  1: [],
  2: [['18:00', '23:30']],
  3: [['18:00', '23:30']],
  4: [['18:00', '23:30']],
  5: [['11:00', '14:30'], ['18:00', '00:00']],
  6: [['11:00', '15:00'], ['18:00', '00:00']],
}

export const CATEGORIES = [
  { id: 'burgers', name: 'Burgers', emoji: '🍔' },
  { id: 'pizzas', name: 'Pizzas', emoji: '🍕' },
  { id: 'pratos', name: 'Pratos', emoji: '🍽️' },
  { id: 'porcoes', name: 'Porções', emoji: '🍟' },
  { id: 'bebidas', name: 'Bebidas', emoji: '🥤' },
  { id: 'sobremesas', name: 'Sobremesas', emoji: '🍮' },
]

// ---------- grupos de opções reutilizáveis ----------
const burgerPonto: OptionGroup = {
  id: 'ponto', name: 'Ponto da carne', min: 1, max: 1,
  options: [
    { id: 'mal', name: 'Mal passado', price: 0 },
    { id: 'ao-ponto', name: 'Ao ponto', price: 0 },
    { id: 'bem', name: 'Bem passado', price: 0 },
  ],
}
const burgerExtras: OptionGroup = {
  id: 'extras', name: 'Turbine seu burger', min: 0, max: 4,
  options: [
    { id: 'bacon', name: 'Bacon crocante', price: 5 },
    { id: 'cheddar', name: 'Cheddar extra', price: 4 },
    { id: 'ovo', name: 'Ovo', price: 3 },
    { id: 'carne', name: 'Carne extra 150g', price: 10 },
    { id: 'cebola', name: 'Cebola caramelizada', price: 4 },
  ],
}
const burgerCombo: OptionGroup = {
  id: 'combo', name: 'Transforme em combo?', min: 0, max: 1,
  options: [{ id: 'combo', name: 'Fritas pequena + refri lata', price: 14 }],
}
const pizzaSize: OptionGroup = {
  id: 'tamanho', name: 'Tamanho', min: 1, max: 1,
  options: [
    { id: 'p', name: 'Pequena · 4 fatias', price: 0 },
    { id: 'm', name: 'Média · 6 fatias', price: 14 },
    { id: 'g', name: 'Grande · 8 fatias', price: 24 },
  ],
}
const pizzaBorda: OptionGroup = {
  id: 'borda', name: 'Borda recheada', min: 0, max: 1,
  options: [
    { id: 'catupiry', name: 'Catupiry', price: 9 },
    { id: 'cheddar', name: 'Cheddar', price: 9 },
    { id: 'chocolate', name: 'Chocolate', price: 11 },
  ],
}
const refriSabor: OptionGroup = {
  id: 'sabor', name: 'Sabor', min: 1, max: 1,
  options: [
    { id: 'cola', name: 'Cola', price: 0 },
    { id: 'cola-zero', name: 'Cola zero', price: 0 },
    { id: 'guarana', name: 'Guaraná', price: 0 },
    { id: 'laranja', name: 'Laranja', price: 0 },
  ],
}

export const PRODUCTS: Product[] = [
  // Burgers
  { id: 'classico', category: 'burgers', name: 'Clássico da Casa', description: 'Pão brioche, blend 150g, queijo prato, alface, tomate e molho da casa.', price: 29.9, image: '/img/classico.webp', badge: 'Mais pedido', groups: [burgerPonto, burgerExtras, burgerCombo] },
  { id: 'bacon', category: 'burgers', name: 'Bacon Lovers', description: 'Blend 150g, muito bacon crocante, cheddar cremoso e cebola caramelizada.', price: 34.9, image: '/img/bacon.webp', groups: [burgerPonto, burgerExtras, burgerCombo] },
  { id: 'smash', category: 'burgers', name: 'Smash Duplo', description: 'Dois smash de 90g, cheddar duplo, picles e maionese de alho.', price: 32.9, image: '/img/smash.webp', badge: 'Novo', groups: [burgerExtras, burgerCombo] },
  { id: 'chicken', category: 'burgers', name: 'Crispy Chicken', description: 'Sobrecoxa empanada crocante, alface americana e maionese de ervas.', price: 28.9, image: '/img/chicken.webp', groups: [burgerExtras, burgerCombo] },

  // Pizzas
  { id: 'margherita', category: 'pizzas', name: 'Margherita', description: 'Molho de tomate italiano, muçarela, tomate e manjericão fresco.', price: 39.9, image: '/img/margherita.webp', badge: 'Vegetariano', groups: [pizzaSize, pizzaBorda] },
  { id: 'calabresa', category: 'pizzas', name: 'Calabresa Especial', description: 'Calabresa fatiada, cebola roxa, azeitonas e muçarela.', price: 41.9, image: '/img/calabresa.webp', badge: 'Mais pedido', groups: [pizzaSize, pizzaBorda] },
  { id: 'suprema', category: 'pizzas', name: 'Suprema', description: 'Pepperoni, frango, champignon, pimentão, cebola e muçarela.', price: 46.9, image: '/img/pizza2.webp', groups: [pizzaSize, pizzaBorda] },

  // Pratos
  { id: 'lasanha', category: 'pratos', name: 'Lasanha à Bolonhesa', description: 'Massa fresca, ragu de carne cozido por 6 horas, molho branco e parmesão gratinado.', price: 42.9, image: '/img/lasanha.webp' },
  { id: 'picanha', category: 'pratos', name: 'Picanha com Fritas', description: '250g de picanha grelhada, fritas, arroz e farofa da casa. Serve 1 pessoa.', price: 64.9, image: '/img/picanha.webp', badge: 'Mais pedido', groups: [{ ...burgerPonto, id: 'ponto-picanha' }] },
  { id: 'file', category: 'pratos', name: 'Filé com Legumes', description: 'Filé mignon grelhado com aspargos, cenoura e batatas rústicas.', price: 69.9, image: '/img/prato2.webp' },

  // Porções
  { id: 'fritas', category: 'porcoes', name: 'Batata Frita', description: 'Porção crocante com sal e alecrim. Acompanha maionese da casa.', price: 22.9, image: '/img/fritas.webp', groups: [{ id: 'cobertura', name: 'Cobertura', min: 0, max: 2, options: [{ id: 'cheddar', name: 'Cheddar', price: 6 }, { id: 'bacon', name: 'Bacon', price: 7 }] }] },
  { id: 'fritas-rusticas', category: 'porcoes', name: 'Fritas Rústicas', description: 'Batatas com casca, páprica defumada e molho barbecue.', price: 25.9, image: '/img/fritas2.webp', badge: 'Vegetariano' },

  // Bebidas
  { id: 'refri', category: 'bebidas', name: 'Refrigerante lata', description: 'Lata de 350 ml bem gelada.', price: 6.5, image: '/img/refri.webp', groups: [refriSabor] },
  { id: 'limonada', category: 'bebidas', name: 'Limonada Suíça', description: 'Limão batido com leite condensado e gelo. 500 ml.', price: 12.9, image: '/img/limonada.webp' },

  // Sobremesas
  { id: 'brownie', category: 'sobremesas', name: 'Brownie', description: 'Brownie de chocolate meio amargo com casquinha crocante.', price: 14.9, image: '/img/brownie.webp', groups: [{ id: 'sorvete', name: 'Acompanhamento', min: 0, max: 1, options: [{ id: 'sorvete', name: 'Bola de sorvete de creme', price: 6 }] }] },
  { id: 'pudim', category: 'sobremesas', name: 'Pudim de Pote', description: 'Pudim de leite condensado com calda de caramelo. 150 g.', price: 11.9, image: '/img/pudim.webp' },
]

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Menor preço possível do produto (preço base + opções obrigatórias mais baratas). */
export function startingPrice(p: Product) {
  return (
    p.price +
    (p.groups ?? []).filter((g) => g.min > 0).reduce((sum, g) => sum + Math.min(...g.options.map((o) => o.price)), 0)
  )
}
