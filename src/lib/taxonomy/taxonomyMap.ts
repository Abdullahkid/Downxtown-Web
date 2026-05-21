/**
 * Compile-time taxonomy map derived from master_taxonomy.json.
 *
 * Maps URL path slugs → taxonomy node metadata. The path slug is the
 * hyphenated, lowercase version of the taxonomy node name — deterministic
 * and human-readable, matching what users and Google expect to see in URLs.
 *
 * Each entry carries:
 *  - leafId   : taxonomy.leafId to query for exact leaf matches
 *  - nodeId   : taxonomy subCategoryId to query for intermediate nodes
 *               (returns products in all children of that node)
 *  - label    : display name for H1, breadcrumb, title
 *  - parent   : parent path for breadcrumb construction
 *  - estimatedCount : shown in description and meta tags
 *
 * IMPORTANT: leafId and nodeId are mutually exclusive. Leaf nodes have a
 * leafId and no nodeId. Intermediate nodes have a nodeId and no leafId.
 *
 * Source of truth: sigma-ktor/src/main/resources/taxonomy/master_taxonomy.json
 * Last synced: 2026-01-17 (taxonomy v2.0-HYBRID-FINAL)
 */

export interface TaxonomyNode {
  /** Used for leaf node queries: taxonomy.leafId === leafId */
  leafId?: string
  /** Used for intermediate node queries: taxonomy.subCategoryIds contains nodeId */
  nodeId?: string
  label: string
  /** Parent path slug for breadcrumb, e.g. "fashion/tops" */
  parent?: string
  estimatedCount?: number
  /** SEO description override — auto-generated if absent */
  description?: string
}

/**
 * Full taxonomy map — 96 nodes covering all categories.
 * Keys are hyphenated URL slugs (what appears in /category/{...path}).
 */
export const TAXONOMY_MAP: Record<string, TaxonomyNode> = {

  // ─────────────────────────────────────────
  // FASHION ROOT
  // ─────────────────────────────────────────

  // Tops (intermediate)
  'fashion/tops': {
    nodeId: '04bda7af06555c89453d9654',
    label: 'Tops',
    parent: 'fashion',
    estimatedCount: 9600,
    description: "Shop tops from India's best D2C fashion brands on Downxtown — T-shirts, shirts, polos, crop tops, hoodies and more.",
  },
  'fashion/tops/t-shirts': {
    leafId: '219abbf9560ee07fae2c7b09',
    label: 'T-Shirts',
    parent: 'fashion/tops',
    estimatedCount: 4500,
    description: "Buy T-shirts from Indian D2C brands on Downxtown. Oversized tees, graphic tees, solid tees and more — direct from authentic brands.",
  },
  'fashion/tops/shirts': {
    leafId: '8d69e7af8a4c238e0749eddf',
    label: 'Shirts',
    parent: 'fashion/tops',
    estimatedCount: 3500,
    description: "Shop shirts from Indian D2C fashion brands. Casual shirts, formal shirts, printed shirts and more from authentic brands.",
  },
  'fashion/tops/polo-shirts': {
    leafId: '0931ccb6d53b11ec62ede22a',
    label: 'Polo Shirts',
    parent: 'fashion/tops',
    estimatedCount: 400,
  },
  'fashion/tops/tank-tops': {
    leafId: '1dfd41c23f5e06f97cbe178e',
    label: 'Tank Tops',
    parent: 'fashion/tops',
    estimatedCount: 200,
  },
  'fashion/tops/crop-tops': {
    leafId: 'fa2bb798b9dec8c449f8aaeb',
    label: 'Crop Tops',
    parent: 'fashion/tops',
    estimatedCount: 300,
  },
  'fashion/tops/blouses': {
    leafId: '58831da397c211d574422d56',
    label: 'Blouses',
    parent: 'fashion/tops',
    estimatedCount: 400,
  },
  'fashion/tops/hoodies': {
    leafId: '5a4d6a105ee2b4e17a849522',
    label: 'Hoodies',
    parent: 'fashion/tops',
    estimatedCount: 500,
    description: "Shop hoodies from Indian D2C brands. Graphic hoodies, plain hoodies, oversized hoodies — direct from authentic brands.",
  },
  'fashion/tops/sweatshirts': {
    leafId: '0738f17dac6ed677271aeed7',
    label: 'Sweatshirts',
    parent: 'fashion/tops',
    estimatedCount: 200,
  },

  // Bottoms (intermediate)
  'fashion/bottoms': {
    nodeId: '2230bc4cfc5d643846a097eb',
    label: 'Bottoms',
    parent: 'fashion',
    estimatedCount: 8500,
  },
  'fashion/bottoms/jeans': {
    leafId: 'e71798d14c6f544ce46ce912',
    label: 'Jeans',
    parent: 'fashion/bottoms',
    estimatedCount: 4000,
    description: "Buy jeans from Indian D2C fashion brands on Downxtown. Slim fit, straight fit, wide leg and more — direct from authentic brands.",
  },
  'fashion/bottoms/trousers': {
    leafId: 'e35fc71fc5a47dba70205f75',
    label: 'Trousers',
    parent: 'fashion/bottoms',
    estimatedCount: 2500,
  },
  'fashion/bottoms/chinos': {
    leafId: '4787a40d99a7c17bc2fba181',
    label: 'Chinos',
    parent: 'fashion/bottoms',
    estimatedCount: 600,
  },
  'fashion/bottoms/shorts': {
    leafId: '6ffed21e4fd62f42cc9e03aa',
    label: 'Shorts',
    parent: 'fashion/bottoms',
    estimatedCount: 500,
  },
  'fashion/bottoms/joggers': {
    leafId: '94d8b16ed539ef0662bba4c4',
    label: 'Joggers',
    parent: 'fashion/bottoms',
    estimatedCount: 400,
  },
  'fashion/bottoms/track-pants': {
    leafId: 'eee98d1be28a33889314aede',
    label: 'Track Pants',
    parent: 'fashion/bottoms',
    estimatedCount: 300,
  },
  'fashion/bottoms/leggings': {
    leafId: 'dfb17d03f5cdd40d60d3254e',
    label: 'Leggings',
    parent: 'fashion/bottoms',
    estimatedCount: 200,
  },
  'fashion/bottoms/palazzos': {
    leafId: 'ed98c57e033cb1fcccbaec96',
    label: 'Palazzos',
    parent: 'fashion/bottoms',
    estimatedCount: 400,
  },

  // Dresses & Jumpsuits
  'fashion/dresses-and-jumpsuits': {
    nodeId: '3efdd6dd0e11adfb3b3669fc',
    label: 'Dresses & Jumpsuits',
    parent: 'fashion',
    estimatedCount: 2700,
  },
  'fashion/dresses-and-jumpsuits/dresses': {
    leafId: 'bd07c75be92ec65673957c39',
    label: 'Dresses',
    parent: 'fashion/dresses-and-jumpsuits',
    estimatedCount: 1500,
    description: "Buy dresses from Indian D2C fashion brands on Downxtown. Western dresses, ethnic dresses, co-ord sets and more.",
  },
  'fashion/dresses-and-jumpsuits/maxi-dresses': {
    leafId: '5aa23434d209a0ad482ca674',
    label: 'Maxi Dresses',
    parent: 'fashion/dresses-and-jumpsuits',
    estimatedCount: 400,
  },
  'fashion/dresses-and-jumpsuits/midi-dresses': {
    leafId: '579b68c3115432f466e647df',
    label: 'Midi Dresses',
    parent: 'fashion/dresses-and-jumpsuits',
    estimatedCount: 300,
  },
  'fashion/dresses-and-jumpsuits/mini-dresses': {
    leafId: 'aabe8bc4c86d4ff708598a78',
    label: 'Mini Dresses',
    parent: 'fashion/dresses-and-jumpsuits',
    estimatedCount: 200,
  },
  'fashion/dresses-and-jumpsuits/jumpsuits': {
    leafId: '73aff68fa2faf55da63ca69a',
    label: 'Jumpsuits',
    parent: 'fashion/dresses-and-jumpsuits',
    estimatedCount: 200,
  },
  'fashion/dresses-and-jumpsuits/rompers': {
    leafId: '6a14c56f53175e2fe7996d78',
    label: 'Rompers',
    parent: 'fashion/dresses-and-jumpsuits',
    estimatedCount: 100,
  },

  // Skirts
  'fashion/skirts': {
    nodeId: 'b4b8caaad86374fad5b094b0',
    label: 'Skirts',
    parent: 'fashion',
    estimatedCount: 400,
  },
  'fashion/skirts/mini-skirts': {
    leafId: '81975eb3b068a6ef6b3ddc24',
    label: 'Mini Skirts',
    parent: 'fashion/skirts',
    estimatedCount: 150,
  },
  'fashion/skirts/midi-skirts': {
    leafId: '9bd42d11b1ffaad0c1c4f0ef',
    label: 'Midi Skirts',
    parent: 'fashion/skirts',
    estimatedCount: 150,
  },
  'fashion/skirts/maxi-skirts': {
    leafId: 'de6bf960faf56815b8b9d78f',
    label: 'Maxi Skirts',
    parent: 'fashion/skirts',
    estimatedCount: 100,
  },

  // Outerwear
  'fashion/outerwear': {
    nodeId: '9ec76fedcae6d2ae22f37d79',
    label: 'Outerwear',
    parent: 'fashion',
    estimatedCount: 2150,
  },
  'fashion/outerwear/jackets': {
    leafId: '1e9b1c8a8ee3b19c27149fb7',
    label: 'Jackets',
    parent: 'fashion/outerwear',
    estimatedCount: 700,
    description: "Shop jackets from Indian D2C brands on Downxtown. Denim jackets, leather jackets, bomber jackets and more.",
  },
  'fashion/outerwear/blazers': {
    leafId: '59167d66aee7257dfb3ecbac',
    label: 'Blazers',
    parent: 'fashion/outerwear',
    estimatedCount: 600,
  },
  'fashion/outerwear/coats': {
    leafId: '85dc014b6557558eaba21e5f',
    label: 'Coats',
    parent: 'fashion/outerwear',
    estimatedCount: 200,
  },
  'fashion/outerwear/sweaters': {
    leafId: '9cd51d7a05e8d33eb4ab6388',
    label: 'Sweaters',
    parent: 'fashion/outerwear',
    estimatedCount: 450,
  },
  'fashion/outerwear/cardigans': {
    leafId: 'cd4a708c5af8d85ca36db67d',
    label: 'Cardigans',
    parent: 'fashion/outerwear',
    estimatedCount: 200,
  },

  // Activewear
  'fashion/activewear': {
    nodeId: 'a1d1d1cb31b472c0c7e1172d',
    label: 'Activewear',
    parent: 'fashion',
    estimatedCount: 700,
  },
  'fashion/activewear/sports-t-shirts': {
    leafId: 'f1e91f364c42c2a65975d177',
    label: 'Sports T-Shirts',
    parent: 'fashion/activewear',
    estimatedCount: 400,
  },
  'fashion/activewear/sports-bras': {
    leafId: '546642cf797ec79c42800b5b',
    label: 'Sports Bras',
    parent: 'fashion/activewear',
    estimatedCount: 100,
  },
  'fashion/activewear/track-suits': {
    leafId: 'a8595b1560e5b8ff4886853d',
    label: 'Track Suits',
    parent: 'fashion/activewear',
    estimatedCount: 200,
  },

  // Sets
  'fashion/sets': {
    nodeId: '5fc3144c62cfa01b58c04360',
    label: 'Sets',
    parent: 'fashion',
    estimatedCount: 800,
  },
  'fashion/sets/co-ord-sets': {
    leafId: 'f881a906bf1ed6864f045660',
    label: 'Co-ord Sets',
    parent: 'fashion/sets',
    estimatedCount: 500,
    description: "Shop co-ord sets from Indian D2C brands. Matching top and bottom sets in ethnic, western and fusion styles.",
  },
  'fashion/sets/suit-sets': {
    leafId: '18c77010e4d5f1a6eeb9d533',
    label: 'Suit Sets',
    parent: 'fashion/sets',
    estimatedCount: 300,
  },

  // Women's Ethnic Wear
  'fashion/womens-ethnic-wear': {
    nodeId: '93ab1129104d1c43671f16b0',
    label: "Women's Ethnic Wear",
    parent: 'fashion',
    estimatedCount: 12500,
    description: "Discover Indian D2C women's ethnic wear brands on Downxtown. Sarees, kurtas, lehengas, salwar suits and more.",
  },
  'fashion/womens-ethnic-wear/sarees': {
    leafId: '0c9d7f343193c187566e8156',
    label: 'Sarees',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 4200,
    description: "Buy sarees from Indian D2C brands on Downxtown. Silk sarees, cotton sarees, designer sarees and more — direct from authentic brands.",
  },
  'fashion/womens-ethnic-wear/kurtas-and-kurtis': {
    leafId: '1e84620d45c061a8ef932b76',
    label: 'Kurtas & Kurtis',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 5500,
    description: "Shop kurtas and kurtis from Indian D2C brands on Downxtown. Cotton kurtas, printed kurtis, straight kurtas and more.",
  },
  'fashion/womens-ethnic-wear/salwar-suits': {
    leafId: '31411911cb81c2610a066274',
    label: 'Salwar Suits',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 1200,
  },
  'fashion/womens-ethnic-wear/lehengas': {
    leafId: '1414d2b7ce7aad2de4fc07b4',
    label: 'Lehengas',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 800,
    description: "Shop lehengas from Indian D2C brands on Downxtown. Bridal lehengas, party lehengas, festive lehengas.",
  },
  'fashion/womens-ethnic-wear/anarkalis': {
    leafId: '792ae555e2979dbc449da251',
    label: 'Anarkalis',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 300,
  },
  'fashion/womens-ethnic-wear/dupattas': {
    leafId: 'cc3ad4b5b3d3a6873379ee93',
    label: 'Dupattas',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 300,
  },
  'fashion/womens-ethnic-wear/churidars': {
    leafId: '331e21bbe8dfbe36e7c9033e',
    label: 'Churidars',
    parent: 'fashion/womens-ethnic-wear',
    estimatedCount: 200,
  },

  // Men's Ethnic Wear
  'fashion/mens-ethnic-wear': {
    nodeId: 'f2f019c270881546be6c1493',
    label: "Men's Ethnic Wear",
    parent: 'fashion',
    estimatedCount: 550,
  },
  'fashion/mens-ethnic-wear/kurtas': {
    leafId: '0a8308935a6f190d16444a34',
    label: 'Kurtas',
    parent: 'fashion/mens-ethnic-wear',
    estimatedCount: 400,
    description: "Buy men's kurtas from Indian D2C brands on Downxtown. Cotton kurtas, festive kurtas, casual kurtas.",
  },
  'fashion/mens-ethnic-wear/sherwanis': {
    leafId: '147bf4acda10a78e7b96c00a',
    label: 'Sherwanis',
    parent: 'fashion/mens-ethnic-wear',
    estimatedCount: 100,
  },
  'fashion/mens-ethnic-wear/nehru-jackets': {
    leafId: '03bcae35ac81e4c3ea395eeb',
    label: 'Nehru Jackets',
    parent: 'fashion/mens-ethnic-wear',
    estimatedCount: 50,
  },

  // Modest Wear
  'fashion/modest-wear': {
    nodeId: '2323fea41ebc2158faeea674',
    label: 'Modest Wear',
    parent: 'fashion',
    estimatedCount: 850,
  },
  'fashion/modest-wear/abayas': {
    leafId: 'b8e49ee33034ce25e2096cb0',
    label: 'Abayas',
    parent: 'fashion/modest-wear',
    estimatedCount: 600,
  },
  'fashion/modest-wear/burqas': {
    leafId: '09a45d2e3970fe01b7b96691',
    label: 'Burqas',
    parent: 'fashion/modest-wear',
    estimatedCount: 150,
  },
  'fashion/modest-wear/hijabs': {
    leafId: '4be0759b2c390bc9f071e44b',
    label: 'Hijabs',
    parent: 'fashion/modest-wear',
    estimatedCount: 100,
  },

  // Suits & Formal Sets
  'fashion/suits-and-formal-sets': {
    nodeId: 'e80e7e54235068fa8735f1ce',
    label: 'Suits & Formal Sets',
    parent: 'fashion',
    estimatedCount: 400,
  },
  'fashion/suits-and-formal-sets/suits': {
    leafId: 'bc6d325f79a8bf6a2f33b39e',
    label: 'Suits',
    parent: 'fashion/suits-and-formal-sets',
    estimatedCount: 300,
  },
  'fashion/suits-and-formal-sets/waistcoats': {
    leafId: '3bde4299b08e20639d5ce4bf',
    label: 'Waistcoats',
    parent: 'fashion/suits-and-formal-sets',
    estimatedCount: 100,
  },

  // ─────────────────────────────────────────
  // FOOTWEAR
  // ─────────────────────────────────────────

  'footwear/casual-shoes': {
    nodeId: 'a4414457e428d575fc50d0b6',
    label: 'Casual Shoes',
    parent: 'footwear',
    estimatedCount: 3250,
  },
  'footwear/casual-shoes/sneakers': {
    leafId: '0943fb36ccb78c7fa74d3123',
    label: 'Sneakers',
    parent: 'footwear/casual-shoes',
    estimatedCount: 2300,
    description: "Buy sneakers from Indian D2C footwear brands on Downxtown. Canvas sneakers, leather sneakers, chunky sneakers and more.",
  },
  'footwear/casual-shoes/loafers': {
    leafId: '15f7799217243e0420fd7d6d',
    label: 'Loafers',
    parent: 'footwear/casual-shoes',
    estimatedCount: 400,
  },
  'footwear/casual-shoes/slip-ons': {
    leafId: 'dfd17a8cb0e36b3e947820ce',
    label: 'Slip-Ons',
    parent: 'footwear/casual-shoes',
    estimatedCount: 300,
  },
  'footwear/casual-shoes/slides': {
    leafId: '11ba2022ca2fe117c59bc694',
    label: 'Slides',
    parent: 'footwear/casual-shoes',
    estimatedCount: 150,
  },
  'footwear/casual-shoes/crocs': {
    leafId: '4352d6a2fcd7eb0828e24943',
    label: 'Crocs',
    parent: 'footwear/casual-shoes',
    estimatedCount: 100,
  },
  'footwear/formal-shoes': {
    nodeId: 'f7f661ce7e3ccf24b045cd78',
    label: 'Formal Shoes',
    parent: 'footwear',
    estimatedCount: 850,
  },
  'footwear/formal-shoes/oxfords': {
    leafId: '936131b8c8680f9f9453f557',
    label: 'Oxfords',
    parent: 'footwear/formal-shoes',
    estimatedCount: 300,
  },
  'footwear/formal-shoes/derbys': {
    leafId: '8220138ebabf6f030dd9a5cb',
    label: 'Derbys',
    parent: 'footwear/formal-shoes',
    estimatedCount: 200,
  },
  'footwear/formal-shoes/brogues': {
    leafId: 'd691aba366f1e08a7b2cc81e',
    label: 'Brogues',
    parent: 'footwear/formal-shoes',
    estimatedCount: 150,
  },
  'footwear/formal-shoes/pumps': {
    leafId: '12e20013428b7804e2a75be4',
    label: 'Pumps',
    parent: 'footwear/formal-shoes',
    estimatedCount: 200,
  },
  'footwear/sports-shoes': {
    nodeId: '8781f9216e1863f276c628e6',
    label: 'Sports Shoes',
    parent: 'footwear',
    estimatedCount: 1100,
  },
  'footwear/sports-shoes/running-shoes': {
    leafId: '6cfca77c490fdd59d9f495f5',
    label: 'Running Shoes',
    parent: 'footwear/sports-shoes',
    estimatedCount: 600,
    description: "Buy running shoes from Indian D2C brands on Downxtown. Lightweight running shoes, trail running shoes and more.",
  },
  'footwear/sports-shoes/training-shoes': {
    leafId: '99788c3a5041524f628d6b73',
    label: 'Training Shoes',
    parent: 'footwear/sports-shoes',
    estimatedCount: 300,
  },
  'footwear/sports-shoes/walking-shoes': {
    leafId: '87d17f9f2ddc37b684b9821e',
    label: 'Walking Shoes',
    parent: 'footwear/sports-shoes',
    estimatedCount: 200,
  },
  'footwear/sandals': {
    leafId: '33cbddfe8c6de7be712e949a',
    label: 'Sandals',
    parent: 'footwear',
    estimatedCount: 1200,
  },
  'footwear/flats': {
    leafId: 'ce21af9c9f5121ce27f473ab',
    label: 'Flats',
    parent: 'footwear',
    estimatedCount: 1500,
  },
  'footwear/heels': {
    nodeId: 'bc1eb589079bef500899592c',
    label: 'Heels',
    parent: 'footwear',
    estimatedCount: 1000,
  },
  'footwear/heels/high-heels': {
    leafId: '0e25f8ffa56b60a3ab76d205',
    label: 'High Heels',
    parent: 'footwear/heels',
    estimatedCount: 500,
  },
  'footwear/heels/wedges': {
    leafId: '80d22d6719954d3a8c3d77c9',
    label: 'Wedges',
    parent: 'footwear/heels',
    estimatedCount: 400,
  },
  'footwear/heels/kitten-heels': {
    leafId: '2baf8170eabfa4e9a07a21dc',
    label: 'Kitten Heels',
    parent: 'footwear/heels',
    estimatedCount: 100,
  },
  'footwear/boots': {
    nodeId: '687aad5aa2b9ece3b76c1fbd',
    label: 'Boots',
    parent: 'footwear',
    estimatedCount: 800,
  },
  'footwear/boots/ankle-boots': {
    leafId: 'bd544cbcf1aae6864140d6bd',
    label: 'Ankle Boots',
    parent: 'footwear/boots',
    estimatedCount: 400,
  },
  'footwear/boots/chelsea-boots': {
    leafId: 'e48db8740efa11159ea8c84f',
    label: 'Chelsea Boots',
    parent: 'footwear/boots',
    estimatedCount: 200,
  },
  'footwear/boots/knee-high-boots': {
    leafId: 'deb8b36f21bb4abf12307bc9',
    label: 'Knee-High Boots',
    parent: 'footwear/boots',
    estimatedCount: 100,
  },
  'footwear/boots/desert-boots': {
    leafId: '5da437bfa8a34998161b91a6',
    label: 'Desert Boots',
    parent: 'footwear/boots',
    estimatedCount: 100,
  },
  'footwear/ethnic-footwear': {
    nodeId: '7dc99d17331fa820090e94d6',
    label: 'Ethnic Footwear',
    parent: 'footwear',
    estimatedCount: 300,
  },
  'footwear/ethnic-footwear/juttis': {
    leafId: '4ff71b2348e1593b7f87aa5d',
    label: 'Juttis',
    parent: 'footwear/ethnic-footwear',
    estimatedCount: 150,
  },
  'footwear/ethnic-footwear/kolhapuris': {
    leafId: 'ef35d00f18d2e9d973d7905e',
    label: 'Kolhapuris',
    parent: 'footwear/ethnic-footwear',
    estimatedCount: 100,
  },
  'footwear/ethnic-footwear/mojaris': {
    leafId: '3138080737eddc969cd01fab',
    label: 'Mojaris',
    parent: 'footwear/ethnic-footwear',
    estimatedCount: 50,
  },
  'footwear/slippers': {
    leafId: 'cc19f3396ce40f5ddaec58d4',
    label: 'Slippers',
    parent: 'footwear',
    estimatedCount: 300,
  },

  // ─────────────────────────────────────────
  // COSMETICS & PERSONAL CARE
  // ─────────────────────────────────────────

  // Makeup
  'cosmetics/makeup': {
    nodeId: '6e51ab6e5bdda24b14177ce3',
    label: 'Makeup',
    parent: 'cosmetics',
    estimatedCount: 1000,
  },
  'cosmetics/makeup/face-makeup': {
    nodeId: '8f4515ff50dd8a45e5f27dd4',
    label: 'Face Makeup',
    parent: 'cosmetics/makeup',
    estimatedCount: 330,
  },
  'cosmetics/makeup/face-makeup/foundation': {
    leafId: '139b944bd1f556bd441f4b97',
    label: 'Foundation',
    parent: 'cosmetics/makeup/face-makeup',
    estimatedCount: 80,
  },
  'cosmetics/makeup/face-makeup/concealer': {
    leafId: 'f9d9d87bace2d506f17a4ce5',
    label: 'Concealer',
    parent: 'cosmetics/makeup/face-makeup',
    estimatedCount: 50,
  },
  'cosmetics/makeup/face-makeup/blush': {
    leafId: 'bd8feb683195073152ddcc15',
    label: 'Blush',
    parent: 'cosmetics/makeup/face-makeup',
    estimatedCount: 40,
  },
  'cosmetics/makeup/eye-makeup': {
    nodeId: '9e8454d5c96d3526065f7492',
    label: 'Eye Makeup',
    parent: 'cosmetics/makeup',
    estimatedCount: 400,
  },
  'cosmetics/makeup/eye-makeup/kajal': {
    leafId: '4a45d2305a5a1f503f167fa4',
    label: 'Kajal',
    parent: 'cosmetics/makeup/eye-makeup',
    estimatedCount: 100,
  },
  'cosmetics/makeup/eye-makeup/eyeliner': {
    leafId: 'ff05852be593af23e30d1a3f',
    label: 'Eyeliner',
    parent: 'cosmetics/makeup/eye-makeup',
    estimatedCount: 80,
  },
  'cosmetics/makeup/eye-makeup/mascara': {
    leafId: '828fa517fd0073bcdf8fef8d',
    label: 'Mascara',
    parent: 'cosmetics/makeup/eye-makeup',
    estimatedCount: 80,
  },
  'cosmetics/makeup/eye-makeup/eyeshadow': {
    leafId: '55d54798542a0e453dbb6fce',
    label: 'Eyeshadow',
    parent: 'cosmetics/makeup/eye-makeup',
    estimatedCount: 100,
  },
  'cosmetics/makeup/lip-makeup': {
    nodeId: '53ef093bf034178c69961f78',
    label: 'Lip Makeup',
    parent: 'cosmetics/makeup',
    estimatedCount: 340,
  },
  'cosmetics/makeup/lip-makeup/lipstick': {
    leafId: '54ac0f88cbb126f82529ad5f',
    label: 'Lipstick',
    parent: 'cosmetics/makeup/lip-makeup',
    estimatedCount: 200,
    description: "Buy lipstick from Indian D2C beauty brands on Downxtown. Matte, glossy, satin and liquid lipsticks.",
  },
  'cosmetics/makeup/lip-makeup/lip-gloss': {
    leafId: 'c3daa77ce359e10876eca560',
    label: 'Lip Gloss',
    parent: 'cosmetics/makeup/lip-makeup',
    estimatedCount: 60,
  },
  'cosmetics/makeup/lip-makeup/lip-balm': {
    leafId: '73518afc204dbb64572cedc9',
    label: 'Lip Balm',
    parent: 'cosmetics/makeup/lip-makeup',
    estimatedCount: 50,
  },

  // Skincare
  'cosmetics/skincare': {
    nodeId: 'c7deede9e78380e694e03fca',
    label: 'Skincare',
    parent: 'cosmetics',
    estimatedCount: 1100,
    description: "Shop skincare from Indian D2C brands on Downxtown. Face wash, serums, moisturizers, sunscreen and more — clean and cruelty-free.",
  },
  'cosmetics/skincare/face-wash': {
    leafId: 'b6aa91a0467f38d46af80745',
    label: 'Face Wash',
    parent: 'cosmetics/skincare',
    estimatedCount: 250,
    description: "Buy face wash from Indian D2C skincare brands. Gel face wash, cream face wash, foaming face wash — direct from authentic brands.",
  },
  'cosmetics/skincare/moisturizers': {
    nodeId: '63359dbe0c11417c6128eddf',
    label: 'Moisturizers',
    parent: 'cosmetics/skincare',
    estimatedCount: 330,
  },
  'cosmetics/skincare/moisturizers/day-cream': {
    leafId: 'ba18efd7de134723dacf0157',
    label: 'Day Cream',
    parent: 'cosmetics/skincare/moisturizers',
    estimatedCount: 150,
  },
  'cosmetics/skincare/moisturizers/night-cream': {
    leafId: '305c00228fedd9174feaebce',
    label: 'Night Cream',
    parent: 'cosmetics/skincare/moisturizers',
    estimatedCount: 100,
  },
  'cosmetics/skincare/serums-and-treatments': {
    nodeId: 'e3ed9f11294fde117be0849b',
    label: 'Serums & Treatments',
    parent: 'cosmetics/skincare',
    estimatedCount: 400,
  },
  'cosmetics/skincare/serums-and-treatments/vitamin-c-serum': {
    leafId: 'fc9d3033d9a3e3fa5844c65d',
    label: 'Vitamin C Serum',
    parent: 'cosmetics/skincare/serums-and-treatments',
    estimatedCount: 120,
    description: "Buy Vitamin C serum from Indian D2C skincare brands on Downxtown.",
  },
  'cosmetics/skincare/serums-and-treatments/niacinamide-serum': {
    leafId: '4281cc845d52fb89fa294992',
    label: 'Niacinamide Serum',
    parent: 'cosmetics/skincare/serums-and-treatments',
    estimatedCount: 80,
  },
  'cosmetics/skincare/serums-and-treatments/retinol-serum': {
    leafId: '174a687ea30b7dc995eeb7e1',
    label: 'Retinol Serum',
    parent: 'cosmetics/skincare/serums-and-treatments',
    estimatedCount: 40,
  },
  'cosmetics/skincare/serums-and-treatments/face-serum': {
    leafId: '3cec2a125c2e71d7fb0710e8',
    label: 'Face Serum',
    parent: 'cosmetics/skincare/serums-and-treatments',
    estimatedCount: 100,
  },
  'cosmetics/skincare/sunscreen': {
    leafId: 'e4496297a2051c5cdf384888',
    label: 'Sunscreen',
    parent: 'cosmetics/skincare',
    estimatedCount: 150,
    description: "Buy sunscreen from Indian D2C skincare brands on Downxtown. SPF 30, SPF 50, tinted sunscreen, mineral sunscreen.",
  },

  // Haircare
  'cosmetics/haircare': {
    nodeId: '6fe42dce416ccb465a2159d5',
    label: 'Haircare',
    parent: 'cosmetics',
    estimatedCount: 510,
  },
  'cosmetics/haircare/shampoos': {
    leafId: '15d276649969920890b63159',
    label: 'Shampoos',
    parent: 'cosmetics/haircare',
    estimatedCount: 150,
  },
  'cosmetics/haircare/conditioners': {
    leafId: '638f6a07d3018ef71e3beb5b',
    label: 'Conditioners',
    parent: 'cosmetics/haircare',
    estimatedCount: 100,
  },
  'cosmetics/haircare/hair-oils': {
    leafId: '6f75109669493e65ca0407f8',
    label: 'Hair Oils',
    parent: 'cosmetics/haircare',
    estimatedCount: 80,
    description: "Buy hair oils from Indian D2C brands on Downxtown. Coconut oil, argan oil, onion oil and more.",
  },
  'cosmetics/haircare/hair-serums': {
    leafId: 'f129e7e94c6046bd81b136a7',
    label: 'Hair Serums',
    parent: 'cosmetics/haircare',
    estimatedCount: 60,
  },
  'cosmetics/haircare/hair-masks': {
    leafId: '40c8b8a379e4574b62c42762',
    label: 'Hair Masks',
    parent: 'cosmetics/haircare',
    estimatedCount: 50,
  },

  // Bodycare
  'cosmetics/bodycare': {
    nodeId: '34af6ec95e8f3709c6ec8724',
    label: 'Bodycare',
    parent: 'cosmetics',
    estimatedCount: 325,
  },
  'cosmetics/bodycare/body-wash': {
    leafId: '61c68c464181098b5592496e',
    label: 'Body Wash',
    parent: 'cosmetics/bodycare',
    estimatedCount: 100,
  },
  'cosmetics/bodycare/body-lotion': {
    leafId: '2dc6b74ad4e754af9278b76c',
    label: 'Body Lotion',
    parent: 'cosmetics/bodycare',
    estimatedCount: 100,
  },
  'cosmetics/bodycare/body-scrub': {
    leafId: '542fa4bfb6f3a2f6facf73c7',
    label: 'Body Scrub',
    parent: 'cosmetics/bodycare',
    estimatedCount: 40,
  },

  // Fragrance
  'cosmetics/fragrance': {
    nodeId: '022a6105058e25ef83183044',
    label: 'Fragrance',
    parent: 'cosmetics',
    estimatedCount: 180,
  },
  'cosmetics/fragrance/perfumes': {
    leafId: '20ebb66d4e4053388e4bbd40',
    label: 'Perfumes',
    parent: 'cosmetics/fragrance',
    estimatedCount: 80,
    description: "Buy perfumes from Indian D2C fragrance brands on Downxtown.",
  },
  'cosmetics/fragrance/deodorants': {
    leafId: '44475ebacbdded13f37641f1',
    label: 'Deodorants',
    parent: 'cosmetics/fragrance',
    estimatedCount: 60,
  },
  'cosmetics/fragrance/body-mist': {
    leafId: 'cc565546d81d458379f33ab7',
    label: 'Body Mist',
    parent: 'cosmetics/fragrance',
    estimatedCount: 40,
  },

  // Grooming
  'cosmetics/grooming': {
    nodeId: 'fa3b5d27324ae38398224ce8',
    label: 'Grooming',
    parent: 'cosmetics',
    estimatedCount: 50,
  },
  'cosmetics/grooming/beard-care': {
    leafId: '9f06ae11b57abaa01ab5b55e',
    label: 'Beard Care',
    parent: 'cosmetics/grooming',
    estimatedCount: 30,
  },
  'cosmetics/grooming/shaving': {
    leafId: '0f1b02c47bd9aa55fa975a34',
    label: 'Shaving',
    parent: 'cosmetics/grooming',
    estimatedCount: 20,
  },
}

/**
 * Root category labels — maps the first path segment to a display name.
 * Used to build the breadcrumb root.
 */
export const ROOT_CATEGORY_LABELS: Record<string, string> = {
  fashion:    'Fashion',
  footwear:   'Footwear',
  cosmetics:  'Beauty & Cosmetics',
  electronics: 'Electronics',
  accessories: 'Accessories',
}

/**
 * All leaf-level taxonomy paths (have a leafId, no nodeId).
 * Used by sitemap.ts to generate static taxonomy URLs.
 */
export const TAXONOMY_LEAF_PATHS: string[] = Object.entries(TAXONOMY_MAP)
  .filter(([, node]) => Boolean(node.leafId))
  .map(([path]) => path)

/**
 * All taxonomy paths (leaf + intermediate) for full sitemap coverage.
 */
export const ALL_TAXONOMY_PATHS: string[] = Object.keys(TAXONOMY_MAP)
