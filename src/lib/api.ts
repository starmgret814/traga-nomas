import { Product, Category, Complement, Company } from "../types/api";

const API_BASE_URL = "https://food-orders-back.onrender.com/api";

async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: any,
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = "Ocurrió un error en la solicitud.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignorar si no es JSON
    }
    throw new Error(errorMessage);
  }

  // Si es un DELETE u otra respuesta sin contenido
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  // --- Auth ---
  async login(user: string, password: string): Promise<{ access_token: string }> {
    return apiRequest<{ access_token: string }>("/auth/login", "POST", { user, password });
  },

  async updateCredentials(
    body: { currentPassword: string; newUser?: string; newPassword?: string },
    token: string
  ): Promise<any> {
    return apiRequest("/auth/me", "PATCH", body, token);
  },

  // --- Company ---
  async getCompany(): Promise<Company> {
    const companies = await apiRequest<Company[]>("/companies");
    if (!Array.isArray(companies) || companies.length === 0) {
      throw new Error("No se encontró información de la empresa.");
    }
    return companies[0];
  },

  async updateCompany(id: string, body: Partial<Company>, token: string): Promise<Company> {
    return apiRequest<Company>(`/companies/${id}`, "PUT", body, token);
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return apiRequest<Category[]>("/categories");
  },

  async createCategory(name: string, token: string): Promise<Category> {
    return apiRequest<Category>("/categories", "POST", { name }, token);
  },

  async updateCategory(id: string, name: string, token: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${id}`, "PUT", { name }, token);
  },

  async deleteCategory(id: string, token: string): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, "DELETE", undefined, token);
  },

  // --- Products ---
  async createProduct(body: Omit<Product, "id">, token: string): Promise<Product> {
    return apiRequest<Product>("/products", "POST", body, token);
  },

  async updateProduct(id: string, body: Partial<Product>, token: string): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`, "PUT", body, token);
  },

  async deleteProduct(id: string, token: string): Promise<void> {
    return apiRequest<void>(`/products/${id}`, "DELETE", undefined, token);
  },

  // --- Complements ---
  async getComplements(): Promise<Complement[]> {
    return apiRequest<Complement[]>("/complements");
  },

  async createComplement(body: Omit<Complement, "id">, token: string): Promise<Complement> {
    return apiRequest<Complement>("/complements", "POST", body, token);
  },

  async updateComplement(id: string, body: Partial<Complement>, token: string): Promise<Complement> {
    return apiRequest<Complement>(`/complements/${id}`, "PUT", body, token);
  },

  async deleteComplement(id: string, token: string): Promise<void> {
    return apiRequest<void>(`/complements/${id}`, "DELETE", undefined, token);
  },

  async assignComplement(complementId: string, categoryId: string, token: string): Promise<any> {
    return apiRequest("/complements/assign", "POST", { complementId, categoryId }, token);
  },

  async unassignComplement(complementId: string, categoryId: string, token: string): Promise<any> {
    return apiRequest(`/complements/assign/${complementId}/${categoryId}`, "DELETE", undefined, token);
  },
};
