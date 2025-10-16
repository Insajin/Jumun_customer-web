// Database Types (simplified for now, will generate from Supabase later)

export interface BrandConfig {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  features: {
    loyalty_enabled: boolean
    scheduled_pickup: boolean
    multi_payment: boolean
    guest_checkout: boolean
  }
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  brand_id: string
  name: string
  address: string
  qr_code?: string | null
  status: 'active' | 'inactive'
  operating_hours: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string
  brand_id: string  // Brand isolation for white-label apps
  phone: string | null
  phone_verified_at: string | null
  loyalty_points: number
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  brand_id: string
  store_id: string | null
  name: string
  display_order: number
  parent_id: string | null
  created_at: string
}

export interface MenuItem {
  id: string
  brand_id: string
  store_id: string | null
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
  inventory_tracked: boolean
  created_at: string
  updated_at: string
}

export interface MenuModifier {
  id: string
  item_id: string
  name: string
  type: 'single' | 'multiple'
  required: boolean
  options: ModifierOption[]
}

export interface ModifierOption {
  id: string
  name: string
  price: number
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  modifiers: {
    modifier: MenuModifier
    selectedOptions: ModifierOption[]
  }[]
}

export interface Order {
  id: string
  store_id: string
  store?: Store
  customer_id: string | null
  customer_phone: string | null
  customer_name: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'waiting' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  pickup_time: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  menu_item_id: string
  quantity: number
  unit_price: number
  modifiers: any[]
  notes: string | null
}
