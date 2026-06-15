export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isPromo: boolean;
  promoPrice: number | null;
  isFeatured: boolean;
  imageUrl: string | null;
  categoryId: string;
  categoryName?: string;
}

export interface Category {
  id: string;
  name: string;
  products?: Product[];
  complementsCategories?: ComplementCategory[];
}

export interface Complement {
  id: string;
  name: string;
  price: number;
  deletedAt?: string | null;
}

export interface ComplementCategory {
  complementId: string;
  categoryId: string;
  deletedAt?: string | null;
  complement?: Complement;
  category?: Category;
}

export interface Company {
  id: string;
  name: string;
  number: string;
  isOpen: boolean;
}
