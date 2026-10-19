'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Banknote,
  Ban,
  BarChart3,
  Boxes,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleDollarSign,
  ClipboardList,
  Clock,
  CreditCard,
  Database,
  Download,
  Edit,
  Eye,
  EyeOff,
  Factory,
  FileDown,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileUp,
  Filter,
  GripVertical,
  History,
  ImagePlus,
  Info,
  KeyRound,
  Landmark,
  List,
  ListFilter,
  ListOrdered,
  Loader2,
  LockKeyhole,
  Menu,
  Minus,
  Moon,
  MoveDown,
  MoveUp,
  Palette,
  Package,
  PanelLeft,
  Pencil,
  Play,
  Plus,
  Printer,
  Receipt,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sun,
  Tag,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  UserCog,
  UserRoundPlus,
  Users,
  WalletCards,
  X,
} from 'lucide-react'

type View = 'pos' | 'movements' | 'production' | 'customers' | 'admin'
type ThemeMode = 'light' | 'dark' | 'system'
type DensityMode = 'comfortable' | 'compact'
type TextSizeMode = 'standard' | 'large'
type AccentPalette = 'coral' | 'sage' | 'ocean' | 'plum' | 'slate'
type PermissionKey = 'admin' | 'reversals' | 'imports' | 'inventory' | 'production'
type CustomFieldEntity = 'products' | 'customers' | 'purchases' | 'production'
type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select'
type DashboardKpiId = 'salesToday' | 'operations' | 'purchases' | 'drafts' | 'lowStock' | 'customers'
type QuickActionId = 'newSale' | 'newPurchase' | 'newCustomer' | 'newProduction' | 'inventory'
type AdminTab = 'catalog' | 'inventory' | 'imports' | 'backups' | 'preferences'
type MovementTab = 'sales' | 'purchases'
type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Otro'
type RecordStatus = 'confirmed' | 'cancelled' | 'draft'
type CatalogDialogType = 'product' | 'ingredient' | 'supplier' | 'recipe' | null
type CustomFieldValue = string | number | boolean
type CustomFieldValues = Record<string, CustomFieldValue | null>
type ModuleConfig = { id: View; label: string; visible: boolean; order: number }
type PosCategoryConfig = { name: string; visible: boolean }
type CustomFieldDefinition = { id: string; label: string; type: CustomFieldType; options: string[]; active: boolean }
type ImportTemplate = { id: string; name: string; module: ImportModule; mapping: Record<string, string>; createdAt: string; updatedAt: string }
type LocalProfile = { id: string; name: string; pinDigest: string; active: boolean; permissions: Record<PermissionKey, boolean>; createdAt: string; updatedAt: string }
type BusinessDetails = { legalName: string; taxId: string; address: string; phone: string; email: string; website: string }
type ReceiptSettings = { header: string; footer: string; showLogo: boolean; showBusinessDetails: boolean; showCustomer: boolean; showPayment: boolean; showTax: boolean; showDiscount: boolean; showFolio: boolean; showDate: boolean }
type ConfigurationTemplate = { kind: 'clarasoft-configuration'; version: 1; settings: Settings; profiles: LocalProfile[]; activeProfileId: string }

type EntityMeta = {
  id: string
  createdAt: string
  updatedAt: string
  version: number
  deviceId: string
  syncStatus: 'local' | 'pending' | 'synced'
  isSample?: boolean
}

type Product = EntityMeta & {
  code: string
  name: string
  category: string
  unit: string
  priceCents: number
  costCents: number
  stock: number
  minStock: number
  active: boolean
  customFields?: CustomFieldValues
}

type Ingredient = EntityMeta & {
  code: string
  name: string
  unit: string
  costCents: number
  stock: number
  minStock: number
  active: boolean
}

type RecipeLine = {
  ingredientId: string
  quantity: number
  unit: string
}

type Recipe = EntityMeta & {
  productId: string
  yieldQuantity: number
  lines: RecipeLine[]
}

type Customer = EntityMeta & {
  name: string
  phone: string
  email: string
  notes: string
  active: boolean
  customFields?: CustomFieldValues
}

type Supplier = EntityMeta & {
  name: string
  phone: string
  email: string
  notes: string
  active: boolean
}

type CartLine = {
  productId: string
  quantity: number
}

type SaleLine = {
  productId: string
  code: string
  name: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

type Sale = EntityMeta & {
  folio: string
  date: string
  customerId: string
  lines: SaleLine[]
  subtotalCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  paymentMethod: PaymentMethod
  receivedCents: number
  changeCents: number
  status: RecordStatus
  reversedAt?: string
}

type PurchaseLine = {
  itemId: string
  itemKind: 'product' | 'ingredient'
  code: string
  name: string
  quantity: number
  unitCostCents: number
  totalCents: number
}

type Purchase = EntityMeta & {
  folio: string
  date: string
  supplierId: string
  reference: string
  lines: PurchaseLine[]
  totalCents: number
  status: RecordStatus
  reversedAt?: string
  customFields?: CustomFieldValues
}

type ProductionRequirement = {
  ingredientId: string
  name: string
  unit: string
  planned: number
  actual: number
}

type ProductionOrder = EntityMeta & {
  folio: string
  productId: string
  productName: string
  plannedOutput: number
  actualOutput: number
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  requirements: ProductionRequirement[]
  notes: string
  customFields?: CustomFieldValues
}

type InventoryMovement = EntityMeta & {
  date: string
  entityType: 'product' | 'ingredient'
  itemId: string
  itemName: string
  quantity: number
  beforeStock: number
  afterStock: number
  sourceType: 'sale' | 'purchase' | 'production' | 'adjustment' | 'reversal'
  sourceId: string
  note: string
}

type DraftCart = {
  id: string
  createdAt: string
  lines: CartLine[]
  customerId: string
  discountCents: number
}

type SyncRun = {
  id: string
  date: string
  fileName: string
  direction: 'import' | 'export' | 'backup' | 'restore'
  scope: string
  status: 'completed' | 'needs_review' | 'error'
  added: number
  updated: number
  duplicated: number
  invalid: number
  conflicts: number
}

type BackupRecord = {
  id: string
  date: string
  source: string
  snapshot: AppState
}

type Settings = {
  currency: string
  taxRate: number
  allowNegativeStock: boolean
  businessName: string
  logoDataUrl: string
  businessDetails: BusinessDetails
  nextSaleNumber: number
  nextPurchaseNumber: number
  nextProductionNumber: number
  folioPrefixes: { sale: string; purchase: string; production: string }
  units: string[]
  categories: string[]
  statusLabels: Record<string, string>
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  quantityDecimals: number
  accentPalette: AccentPalette
  themeMode: ThemeMode
  density: DensityMode
  textSize: TextSizeMode
  navigation: ModuleConfig[]
  pos: { categories: PosCategoryConfig[]; productOrder: string[]; quickActions: QuickActionId[]; enabledPaymentMethods: PaymentMethod[] }
  customFields: Record<CustomFieldEntity, CustomFieldDefinition[]>
  receipt: ReceiptSettings
  importTemplates: ImportTemplate[]
  dashboard: { kpis: DashboardKpiId[]; quickActions: QuickActionId[] }
}

type AppState = {
  schemaVersion: number
  deviceId: string
  sampleData: boolean
  lastSavedAt: string
  products: Product[]
  ingredients: Ingredient[]
  recipes: Recipe[]
  customers: Customer[]
  suppliers: Supplier[]
  sales: Sale[]
  purchases: Purchase[]
  productionOrders: ProductionOrder[]
  inventoryMovements: InventoryMovement[]
  heldCarts: DraftCart[]
  activeCart: {
    lines: CartLine[]
    customerId: string
    discountCents: number
  }
  settings: Settings
  profiles: LocalProfile[]
  activeProfileId: string
  syncRuns: SyncRun[]
  backups: BackupRecord[]
}

type Notice = {
  tone: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
}

type ImportError = {
  file: string
  sheet: string
  row: number
  field: string
  issue: string
  correction: string
}

type ImportConflict = {
  key: string
  name: string
  localValue: string
  fileValue: string
  choice: 'local' | 'file' | 'duplicate'
}

type ImportValidation = {
  added: number
  updated: number
  duplicated: number
  unchanged: number
  invalid: number
  conflicts: number
}

type ImportPreparedRow = {
  rowNumber: number
  values: Record<string, string>
  existingId?: string
  classification: 'added' | 'updated' | 'duplicate' | 'unchanged' | 'invalid' | 'conflict'
}

type ImportModule = 'products' | 'ingredients' | 'customers' | 'suppliers'

type PurchaseDraftLine = {
  itemId: string
  itemKind: 'product' | 'ingredient'
  quantity: string
  unitCost: string
}

const DB_NAME = 'clarasoft-modern-local'
const DB_VERSION = 1
const DB_STORE = 'app-state'
const DEVICE_ID_KEY = 'clarasoft-device-id'
const CURRENCY_LOCALE = 'es-MX'
const staticSeedDate = '2026-10-11T09:30:00.000Z'
const staticSeedDateEarlier = '2026-10-10T15:20:00.000Z'

const productCategories = ['Todos', 'Panadería', 'Bebidas', 'Alimentos']
const paymentOptions: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro']
const TASK_COMPLETED = 'TASK_COMPLETED'
const DEFAULT_ADMIN_PIN_DIGEST = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
const accentHexByPalette: Record<AccentPalette, string> = { coral: '#ea580c', sage: '#059669', ocean: '#0284c7', plum: '#7c3aed', slate: '#475569' }
const accentPaletteOptions: { value: AccentPalette; label: string; swatch: string; classes: string }[] = [
  { value: 'coral', label: 'Coral', swatch: 'bg-orange-500', classes: 'text-orange-700 dark:text-orange-300' },
  { value: 'sage', label: 'Salvia', swatch: 'bg-emerald-600', classes: 'text-emerald-700 dark:text-emerald-300' },
  { value: 'ocean', label: 'Océano', swatch: 'bg-sky-600', classes: 'text-sky-700 dark:text-sky-300' },
  { value: 'plum', label: 'Ciruela', swatch: 'bg-violet-600', classes: 'text-violet-700 dark:text-violet-300' },
  { value: 'slate', label: 'Pizarra', swatch: 'bg-slate-600', classes: 'text-slate-700 dark:text-slate-300' },
]
const permissionOptions: { key: PermissionKey; label: string; description: string }[] = [
  { key: 'admin', label: 'Administración', description: 'Configuración, catálogo y respaldos' },
  { key: 'reversals', label: 'Reversos', description: 'Anular ventas y compras confirmadas' },
  { key: 'imports', label: 'Importaciones', description: 'Validar y aplicar archivos' },
  { key: 'inventory', label: 'Inventario', description: 'Ajustar existencias manualmente' },
  { key: 'production', label: 'Producción', description: 'Crear, iniciar y completar órdenes' },
]
const dashboardKpiOptions: { id: DashboardKpiId; label: string }[] = [
  { id: 'salesToday', label: 'Ventas confirmadas' },
  { id: 'operations', label: 'Operaciones' },
  { id: 'purchases', label: 'Compras confirmadas' },
  { id: 'drafts', label: 'Borradores' },
  { id: 'lowStock', label: 'Alertas de inventario' },
  { id: 'customers', label: 'Clientes activos' },
]
const quickActionOptions: { id: QuickActionId; label: string }[] = [
  { id: 'newSale', label: 'Nueva venta' },
  { id: 'newPurchase', label: 'Registrar compra' },
  { id: 'newCustomer', label: 'Nuevo cliente' },
  { id: 'newProduction', label: 'Nueva producción' },
  { id: 'inventory', label: 'Ajustar inventario' },
]
const importModules: { value: ImportModule; label: string; fields: string[] }[] = [
  { value: 'products', label: 'Productos', fields: ['id', 'code', 'name', 'category', 'unit', 'price', 'cost', 'stock', 'minStock', 'active'] },
  { value: 'ingredients', label: 'Insumos', fields: ['id', 'code', 'name', 'unit', 'cost', 'stock', 'minStock', 'active'] },
  { value: 'customers', label: 'Clientes', fields: ['id', 'name', 'phone', 'email', 'notes', 'active'] },
  { value: 'suppliers', label: 'Proveedores', fields: ['id', 'name', 'phone', 'email', 'notes', 'active'] },
]

function createDefaultSettings(productIds: string[] = []): Settings {
  const categories = [...productCategories.slice(1)]
  return {
    currency: 'MXN',
    taxRate: 0,
    allowNegativeStock: false,
    businessName: 'ClaraSoft Bakery',
    logoDataUrl: '',
    businessDetails: { legalName: '', taxId: '', address: '', phone: '', email: '', website: '' },
    nextSaleNumber: 1048,
    nextPurchaseNumber: 221,
    nextProductionNumber: 31,
    folioPrefixes: { sale: 'V-', purchase: 'C-', production: 'OP-' },
    units: ['pieza', 'kg', 'g', 'L', 'ml', 'caja'],
    categories,
    statusLabels: { confirmed: 'Confirmada', cancelled: 'Anulada', draft: 'Borrador', in_progress: 'En proceso', planned: 'Programada', completed: 'Completada' },
    dateFormat: 'DD/MM/YYYY',
    quantityDecimals: 2,
    accentPalette: 'coral',
    themeMode: 'light',
    density: 'comfortable',
    textSize: 'standard',
    navigation: [
      { id: 'pos', label: 'Punto de venta', visible: true, order: 0 },
      { id: 'movements', label: 'Movimientos', visible: true, order: 1 },
      { id: 'production', label: 'Producción', visible: true, order: 2 },
      { id: 'customers', label: 'Clientes', visible: true, order: 3 },
      { id: 'admin', label: 'Administración', visible: true, order: 4 },
    ],
    pos: {
      categories: [{ name: 'Todos', visible: true }, ...categories.map((name) => ({ name, visible: true }))],
      productOrder: productIds,
      quickActions: ['newCustomer', 'newPurchase'],
      enabledPaymentMethods: [...paymentOptions],
    },
    customFields: {
      products: [{ id: 'origin', label: 'Origen', type: 'text', options: [], active: true }],
      customers: [{ id: 'customerType', label: 'Tipo de cliente', type: 'select', options: ['Regular', 'Mayorista', 'Corporativo'], active: true }],
      purchases: [{ id: 'deliveryDate', label: 'Fecha de entrega', type: 'date', options: [], active: true }],
      production: [{ id: 'batchCode', label: 'Código de lote', type: 'text', options: [], active: true }],
    },
    receipt: { header: 'Gracias por tu compra', footer: 'Conserva este comprobante.', showLogo: true, showBusinessDetails: true, showCustomer: true, showPayment: true, showTax: true, showDiscount: true, showFolio: true, showDate: true },
    importTemplates: [],
    dashboard: { kpis: ['salesToday', 'operations', 'purchases', 'drafts'], quickActions: ['newSale', 'newPurchase'] },
  }
}

function createDefaultProfiles(): LocalProfile[] {
  return [{ id: 'profile-admin', name: 'Administrador', pinDigest: DEFAULT_ADMIN_PIN_DIGEST, active: true, permissions: { admin: true, reversals: true, imports: true, inventory: true, production: true }, createdAt: staticSeedDateEarlier, updatedAt: staticSeedDate }]
}

function mergeSettings(saved: Partial<Settings> | undefined, productIds: string[] = []): Settings {
  const defaults = createDefaultSettings(productIds)
  const source = saved ?? {}
  const navigation = Array.isArray(source.navigation) ? source.navigation : defaults.navigation
  const defaultNavigationById = new Map(defaults.navigation.map((item) => [item.id, item]))
  const mergedNavigation = defaults.navigation.map((item) => {
    const stored = navigation.find((candidate) => candidate?.id === item.id)
    return { ...item, ...(stored ?? {}) }
  }).sort((a, b) => a.order - b.order).map((item, index) => ({ ...item, order: index }))
  const customFields = {
    products: Array.isArray(source.customFields?.products) ? source.customFields.products : defaults.customFields.products,
    customers: Array.isArray(source.customFields?.customers) ? source.customFields.customers : defaults.customFields.customers,
    purchases: Array.isArray(source.customFields?.purchases) ? source.customFields.purchases : defaults.customFields.purchases,
    production: Array.isArray(source.customFields?.production) ? source.customFields.production : defaults.customFields.production,
  }
  const storedPos: Partial<Settings['pos']> = source.pos ?? {}
  const storedDashboard: Partial<Settings['dashboard']> = source.dashboard ?? {}
  return {
    ...defaults,
    ...source,
    businessDetails: { ...defaults.businessDetails, ...(source.businessDetails ?? {}) },
    folioPrefixes: { ...defaults.folioPrefixes, ...(source.folioPrefixes ?? {}) },
    navigation: mergedNavigation,
    units: Array.isArray(source.units) && source.units.length ? source.units.filter(Boolean) : defaults.units,
    categories: Array.isArray(source.categories) && source.categories.length ? source.categories.filter(Boolean) : defaults.categories,
    statusLabels: { ...defaults.statusLabels, ...(source.statusLabels ?? {}) },
    pos: {
      ...defaults.pos,
      ...storedPos,
      categories: Array.isArray(storedPos.categories) && storedPos.categories.length ? storedPos.categories : defaults.pos.categories,
      productOrder: Array.isArray(storedPos.productOrder) && storedPos.productOrder.length ? [...storedPos.productOrder, ...productIds.filter((id) => !storedPos.productOrder?.includes(id))] : productIds,
      quickActions: Array.isArray(storedPos.quickActions) ? storedPos.quickActions : defaults.pos.quickActions,
      enabledPaymentMethods: Array.isArray(storedPos.enabledPaymentMethods) && storedPos.enabledPaymentMethods.length ? storedPos.enabledPaymentMethods : defaults.pos.enabledPaymentMethods,
    },
    customFields,
    receipt: { ...defaults.receipt, ...(source.receipt ?? {}) },
    importTemplates: Array.isArray(source.importTemplates) ? source.importTemplates : defaults.importTemplates,
    dashboard: {
      ...defaults.dashboard,
      ...storedDashboard,
      kpis: Array.isArray(storedDashboard.kpis) && storedDashboard.kpis.length ? storedDashboard.kpis : defaults.dashboard.kpis,
      quickActions: Array.isArray(storedDashboard.quickActions) ? storedDashboard.quickActions : defaults.dashboard.quickActions,
    },
    accentPalette: accentPaletteOptions.some((item) => item.value === source.accentPalette) ? source.accentPalette as AccentPalette : defaults.accentPalette,
    themeMode: source.themeMode === 'dark' || source.themeMode === 'system' || source.themeMode === 'light' ? source.themeMode : defaults.themeMode,
    density: source.density === 'compact' ? 'compact' : 'comfortable',
    textSize: source.textSize === 'large' ? 'large' : 'standard',
    quantityDecimals: Number.isFinite(source.quantityDecimals) ? Math.min(4, Math.max(0, Number(source.quantityDecimals))) : defaults.quantityDecimals,
    dateFormat: source.dateFormat === 'MM/DD/YYYY' || source.dateFormat === 'YYYY-MM-DD' ? source.dateFormat : defaults.dateFormat,
  }
}


function makeSeedMeta(id: string, isSample = true): EntityMeta {
  return {
    id,
    createdAt: staticSeedDateEarlier,
    updatedAt: staticSeedDate,
    version: 1,
    deviceId: 'demo-device',
    syncStatus: 'synced',
    isSample,
  }
}

function createSeedState(): AppState {
  const products: Product[] = [
    { ...makeSeedMeta('product-croissant'), code: 'P-001', name: 'Croissant clásico', category: 'Panadería', unit: 'pieza', priceCents: 3800, costCents: 1800, stock: 24, minStock: 6, active: true },
    { ...makeSeedMeta('product-cafe'), code: 'P-002', name: 'Café americano', category: 'Bebidas', unit: 'vaso', priceCents: 4200, costCents: 1200, stock: 60, minStock: 12, active: true },
    { ...makeSeedMeta('product-pan'), code: 'P-003', name: 'Pan campesino', category: 'Panadería', unit: 'pieza', priceCents: 7600, costCents: 3200, stock: 8, minStock: 10, active: true },
    { ...makeSeedMeta('product-te'), code: 'P-004', name: 'Té frío limón', category: 'Bebidas', unit: 'vaso', priceCents: 4900, costCents: 1700, stock: 16, minStock: 8, active: true },
    { ...makeSeedMeta('product-sandwich'), code: 'P-005', name: 'Sándwich de pavo', category: 'Alimentos', unit: 'pieza', priceCents: 9500, costCents: 4300, stock: 6, minStock: 4, active: true },
    { ...makeSeedMeta('product-galleta'), code: 'P-006', name: 'Galleta de avena', category: 'Panadería', unit: 'pieza', priceCents: 2900, costCents: 900, stock: 31, minStock: 10, active: true },
  ]
  const ingredients: Ingredient[] = [
    { ...makeSeedMeta('ingredient-flour'), code: 'I-001', name: 'Harina de trigo', unit: 'kg', costCents: 2800, stock: 42, minStock: 10, active: true },
    { ...makeSeedMeta('ingredient-yeast'), code: 'I-002', name: 'Levadura seca', unit: 'g', costCents: 4, stock: 480, minStock: 200, active: true },
    { ...makeSeedMeta('ingredient-oil'), code: 'I-003', name: 'Aceite vegetal', unit: 'L', costCents: 4200, stock: 3.2, minStock: 1, active: true },
    { ...makeSeedMeta('ingredient-butter'), code: 'I-004', name: 'Mantequilla', unit: 'kg', costCents: 11500, stock: 1.2, minStock: 2, active: true },
    { ...makeSeedMeta('ingredient-oats'), code: 'I-005', name: 'Avena', unit: 'kg', costCents: 3600, stock: 8, minStock: 2, active: true },
  ]
  const recipes: Recipe[] = [
    { ...makeSeedMeta('recipe-pan'), productId: 'product-pan', yieldQuantity: 10, lines: [{ ingredientId: 'ingredient-flour', quantity: 4, unit: 'kg' }, { ingredientId: 'ingredient-yeast', quantity: 80, unit: 'g' }, { ingredientId: 'ingredient-oil', quantity: 0.8, unit: 'L' }] },
    { ...makeSeedMeta('recipe-croissant'), productId: 'product-croissant', yieldQuantity: 12, lines: [{ ingredientId: 'ingredient-flour', quantity: 2.4, unit: 'kg' }, { ingredientId: 'ingredient-butter', quantity: 1, unit: 'kg' }, { ingredientId: 'ingredient-yeast', quantity: 45, unit: 'g' }] },
    { ...makeSeedMeta('recipe-galleta'), productId: 'product-galleta', yieldQuantity: 20, lines: [{ ingredientId: 'ingredient-oats', quantity: 1.2, unit: 'kg' }, { ingredientId: 'ingredient-butter', quantity: 0.4, unit: 'kg' }] },
  ]
  const customers: Customer[] = [
    { ...makeSeedMeta('customer-maria'), name: 'María López', phone: '55 1842 9031', email: 'maria@estudionorte.mx', notes: 'Prefiere recibo digital.', active: true },
    { ...makeSeedMeta('customer-estudio'), name: 'Estudio Norte', phone: '55 9044 1120', email: 'compras@estudionorte.mx', notes: 'Compra recurrente de reuniones.', active: true },
    { ...makeSeedMeta('customer-diego'), name: 'Diego Ramírez', phone: '55 2210 4832', email: '', notes: '', active: true },
  ]
  const suppliers: Supplier[] = [
    { ...makeSeedMeta('supplier-harina'), name: 'Molinos del Valle', phone: '55 3321 7788', email: 'ventas@molinosvalle.mx', notes: 'Entrega martes y viernes.', active: true },
    { ...makeSeedMeta('supplier-lacteos'), name: 'Lácteos La Plaza', phone: '55 1102 4500', email: 'pedidos@laplaza.mx', notes: 'Mantequilla y lácteos.', active: true },
  ]
  const sales: Sale[] = [
    { ...makeSeedMeta('sale-1047'), folio: 'V-1047', date: staticSeedDate, customerId: 'customer-maria', lines: [{ productId: 'product-pan', code: 'P-003', name: 'Pan campesino', quantity: 2, unitPriceCents: 7600, totalCents: 15200 }, { productId: 'product-sandwich', code: 'P-005', name: 'Sándwich de pavo', quantity: 2, unitPriceCents: 9500, totalCents: 19000 }], subtotalCents: 34200, discountCents: 0, taxCents: 0, totalCents: 34200, paymentMethod: 'Tarjeta', receivedCents: 34200, changeCents: 0, status: 'confirmed' },
    { ...makeSeedMeta('sale-1046'), folio: 'V-1046', date: staticSeedDateEarlier, customerId: '', lines: [{ productId: 'product-croissant', code: 'P-001', name: 'Croissant clásico', quantity: 2, unitPriceCents: 3800, totalCents: 7600 }, { productId: 'product-cafe', code: 'P-002', name: 'Café americano', quantity: 1, unitPriceCents: 4200, totalCents: 4200 }, { productId: 'product-te', code: 'P-004', name: 'Té frío limón', quantity: 1, unitPriceCents: 4900, totalCents: 4900 }], subtotalCents: 16700, discountCents: 0, taxCents: 0, totalCents: 16700, paymentMethod: 'Efectivo', receivedCents: 20000, changeCents: 3300, status: 'confirmed' },
    { ...makeSeedMeta('sale-1045'), folio: 'V-1045', date: '2026-10-09T12:05:00.000Z', customerId: 'customer-estudio', lines: [{ productId: 'product-cafe', code: 'P-002', name: 'Café americano', quantity: 10, unitPriceCents: 4200, totalCents: 42000 }, { productId: 'product-galleta', code: 'P-006', name: 'Galleta de avena', quantity: 10, unitPriceCents: 2900, totalCents: 29000 }], subtotalCents: 71000, discountCents: 0, taxCents: 0, totalCents: 71000, paymentMethod: 'Transferencia', receivedCents: 71000, changeCents: 0, status: 'draft' },
  ]
  const purchases: Purchase[] = [
    { ...makeSeedMeta('purchase-220'), folio: 'C-220', date: staticSeedDateEarlier, supplierId: 'supplier-harina', reference: 'OC-778', lines: [{ itemId: 'ingredient-flour', itemKind: 'ingredient', code: 'I-001', name: 'Harina de trigo', quantity: 20, unitCostCents: 2800, totalCents: 56000 }, { itemId: 'ingredient-yeast', itemKind: 'ingredient', code: 'I-002', name: 'Levadura seca', quantity: 500, unitCostCents: 4, totalCents: 2000 }], totalCents: 58000, status: 'confirmed' },
    { ...makeSeedMeta('purchase-219'), folio: 'C-219', date: '2026-10-07T10:00:00.000Z', supplierId: 'supplier-lacteos', reference: 'REM-103', lines: [{ itemId: 'ingredient-butter', itemKind: 'ingredient', code: 'I-004', name: 'Mantequilla', quantity: 2, unitCostCents: 11500, totalCents: 23000 }], totalCents: 23000, status: 'confirmed' },
  ]
  const productionOrders: ProductionOrder[] = [
    { ...makeSeedMeta('production-028'), folio: 'OP-028', productId: 'product-pan', productName: 'Pan campesino', plannedOutput: 20, actualOutput: 12, scheduledAt: staticSeedDate, startedAt: staticSeedDateEarlier, status: 'in_progress', requirements: [{ ingredientId: 'ingredient-flour', name: 'Harina de trigo', unit: 'kg', planned: 8, actual: 4.8 }, { ingredientId: 'ingredient-yeast', name: 'Levadura seca', unit: 'g', planned: 160, actual: 96 }, { ingredientId: 'ingredient-oil', name: 'Aceite vegetal', unit: 'L', planned: 1.6, actual: 0.96 }], notes: 'Lote de la mañana.' },
    { ...makeSeedMeta('production-029'), folio: 'OP-029', productId: 'product-croissant', productName: 'Croissant clásico', plannedOutput: 48, actualOutput: 0, scheduledAt: '2026-10-11T14:00:00.000Z', status: 'planned', requirements: [{ ingredientId: 'ingredient-flour', name: 'Harina de trigo', unit: 'kg', planned: 9.6, actual: 0 }, { ingredientId: 'ingredient-butter', name: 'Mantequilla', unit: 'kg', planned: 4, actual: 0 }, { ingredientId: 'ingredient-yeast', name: 'Levadura seca', unit: 'g', planned: 180, actual: 0 }], notes: '' },
    { ...makeSeedMeta('production-030'), folio: 'OP-030', productId: 'product-galleta', productName: 'Galleta de avena', plannedOutput: 40, actualOutput: 0, scheduledAt: '2026-10-12T08:00:00.000Z', status: 'planned', requirements: [{ ingredientId: 'ingredient-oats', name: 'Avena', unit: 'kg', planned: 2.4, actual: 0 }, { ingredientId: 'ingredient-butter', name: 'Mantequilla', unit: 'kg', planned: 0.8, actual: 0 }], notes: 'Falta mantequilla para completar el lote.' },
  ]
  const inventoryMovements: InventoryMovement[] = [
    { ...makeSeedMeta('movement-sale-1047'), date: staticSeedDate, entityType: 'product', itemId: 'product-pan', itemName: 'Pan campesino', quantity: -2, beforeStock: 10, afterStock: 8, sourceType: 'sale', sourceId: 'sale-1047', note: 'Venta V-1047' },
    { ...makeSeedMeta('movement-sale-1047-sandwich'), date: staticSeedDate, entityType: 'product', itemId: 'product-sandwich', itemName: 'Sándwich de pavo', quantity: -2, beforeStock: 8, afterStock: 6, sourceType: 'sale', sourceId: 'sale-1047', note: 'Venta V-1047' },
    { ...makeSeedMeta('movement-purchase-220'), date: staticSeedDateEarlier, entityType: 'ingredient', itemId: 'ingredient-flour', itemName: 'Harina de trigo', quantity: 20, beforeStock: 22, afterStock: 42, sourceType: 'purchase', sourceId: 'purchase-220', note: 'Compra C-220' },
    { ...makeSeedMeta('movement-production-028'), date: staticSeedDate, entityType: 'ingredient', itemId: 'ingredient-flour', itemName: 'Harina de trigo', quantity: -4.8, beforeStock: 46.8, afterStock: 42, sourceType: 'production', sourceId: 'production-028', note: 'Consumo OP-028' },
  ]
  return {
    schemaVersion: 2,
    deviceId: 'demo-device',
    sampleData: true,
    lastSavedAt: staticSeedDate,
    products,
    ingredients,
    recipes,
    customers,
    suppliers,
    sales,
    purchases,
    productionOrders,
    inventoryMovements,
    heldCarts: [],
    activeCart: { lines: [{ productId: 'product-croissant', quantity: 2 }, { productId: 'product-cafe', quantity: 1 }, { productId: 'product-te', quantity: 1 }], customerId: '', discountCents: 0 },
    settings: mergeSettings({ currency: 'MXN', taxRate: 0, allowNegativeStock: false, businessName: 'ClaraSoft Bakery', nextSaleNumber: 1048, nextPurchaseNumber: 221, nextProductionNumber: 31 }, products.map((product) => product.id)),
    profiles: createDefaultProfiles(),
    activeProfileId: 'profile-admin',
    syncRuns: [{ id: 'sync-demo', date: staticSeedDateEarlier, fileName: 'inventario-octubre.xlsx', direction: 'import', scope: 'Productos e insumos', status: 'needs_review', added: 12, updated: 4, duplicated: 2, invalid: 1, conflicts: 2 }],
    backups: [],
  }
}

function nowIso() {
  return new Date().toISOString()
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state)) as AppState
}

function migrateAppState(saved: Partial<AppState>): AppState {
  const fallback = createSeedState()
  const products = Array.isArray(saved.products) ? saved.products as Product[] : fallback.products
  const ingredients = Array.isArray(saved.ingredients) ? saved.ingredients as Ingredient[] : fallback.ingredients
  const customers = Array.isArray(saved.customers) ? saved.customers as Customer[] : fallback.customers
  const profiles = Array.isArray(saved.profiles) && saved.profiles.length ? saved.profiles as LocalProfile[] : createDefaultProfiles()
  const activeProfileId = profiles.some((profile) => profile.id === saved.activeProfileId && profile.active) ? String(saved.activeProfileId) : profiles.find((profile) => profile.active)?.id ?? profiles[0]?.id ?? 'profile-admin'
  return {
    ...fallback,
    ...saved,
    schemaVersion: 2,
    deviceId: typeof saved.deviceId === 'string' && saved.deviceId ? saved.deviceId : fallback.deviceId,
    sampleData: typeof saved.sampleData === 'boolean' ? saved.sampleData : fallback.sampleData,
    products,
    ingredients,
    recipes: Array.isArray(saved.recipes) ? saved.recipes as Recipe[] : fallback.recipes,
    customers,
    suppliers: Array.isArray(saved.suppliers) ? saved.suppliers as Supplier[] : fallback.suppliers,
    sales: Array.isArray(saved.sales) ? saved.sales as Sale[] : fallback.sales,
    purchases: Array.isArray(saved.purchases) ? saved.purchases as Purchase[] : fallback.purchases,
    productionOrders: Array.isArray(saved.productionOrders) ? saved.productionOrders as ProductionOrder[] : fallback.productionOrders,
    inventoryMovements: Array.isArray(saved.inventoryMovements) ? saved.inventoryMovements as InventoryMovement[] : fallback.inventoryMovements,
    heldCarts: Array.isArray(saved.heldCarts) ? saved.heldCarts as DraftCart[] : [],
    activeCart: saved.activeCart && typeof saved.activeCart === 'object' ? { lines: Array.isArray(saved.activeCart.lines) ? saved.activeCart.lines : [], customerId: saved.activeCart.customerId ?? '', discountCents: Number(saved.activeCart.discountCents) || 0 } : fallback.activeCart,
    settings: mergeSettings(saved.settings, products.map((product) => product.id)),
    profiles,
    activeProfileId,
    syncRuns: Array.isArray(saved.syncRuns) ? saved.syncRuns as SyncRun[] : [],
    backups: Array.isArray(saved.backups) ? saved.backups as BackupRecord[] : [],
    lastSavedAt: typeof saved.lastSavedAt === 'string' && saved.lastSavedAt ? saved.lastSavedAt : fallback.lastSavedAt,
  }
}

async function digestPin(pin: string) {
  const value = pin.trim()
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(value)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  return Array.from(value).reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 2166136261).toString(16).padStart(8, '0')
}

function parseMoneyInput(value: string) {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric * 100)) : 0
}

function formatMoney(cents: number, currency = 'MXN') {
  return new Intl.NumberFormat(CURRENCY_LOCALE, { style: 'currency', currency, maximumFractionDigits: 2 }).format((Number(cents) || 0) / 100)
}

function formatQuantity(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, { maximumFractionDigits }).format(Number(value) || 0)
}

function formatDateByPattern(value: string, pattern: Settings['dateFormat']) {
  if (!value || value.length < 10) return 'Sin fecha'
  const [year, month, day] = value.slice(0, 10).split('-')
  if (pattern === 'MM/DD/YYYY') return `${month}/${day}/${year}`
  if (pattern === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  return `${day}/${month}/${year}`
}

function formatDateLabel(value: string, pattern: Settings['dateFormat'] = 'DD/MM/YYYY') {
  return formatDateByPattern(value, pattern)
}

function formatDateTimeLabel(value: string, pattern: Settings['dateFormat'] = 'DD/MM/YYYY') {
  if (!value || value.length < 16) return formatDateLabel(value, pattern)
  return `${formatDateLabel(value, pattern)} · ${value.slice(11, 16)}`
}

function openLocalDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no está disponible en este navegador.'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento local.'))
  })
}

async function loadLocalState() {
  const database = await openLocalDatabase()
  return new Promise<AppState | null>((resolve, reject) => {
    const request = database.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get('snapshot')
    request.onsuccess = () => resolve((request.result as AppState | undefined) ?? null)
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer el estado local.'))
  })
}

async function saveLocalState(state: AppState) {
  const database = await openLocalDatabase()
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, 'readwrite')
    transaction.objectStore(DB_STORE).put(state, 'snapshot')
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar el estado local.'))
  })
}

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function encodeCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const quote = (value: unknown) => {
    const text = value == null ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [headers.map(quote).join(','), ...rows.map((row) => headers.map((header) => quote(row[header])).join(','))].join('\n')
}

function parseCsv(text: string) {
  const clean = text.replace(/^\uFEFF/, '')
  const delimiter = clean.split('\n')[0]?.includes(';') && !clean.split('\n')[0]?.includes(',') ? ';' : ','
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let quoted = false
  for (let index = 0; index < clean.length; index += 1) {
    const character = clean[index]
    const next = clean[index + 1]
    if (character === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === delimiter && !quoted) {
      row.push(current)
      current = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(current)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      current = ''
    } else {
      current += character
    }
  }
  if (current || row.length > 0) {
    row.push(current)
    if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  }
  const headers = (rows.shift() ?? []).map((header) => header.trim())
  return rows.map((cells) => headers.reduce<Record<string, string>>((record, header, index) => ({ ...record, [header || `Columna ${index + 1}`]: (cells[index] ?? '').trim() }), {}))
}

function normalizeText(value: string) {
  return String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
}

function parseBoolean(value: string, fallback = true) {
  if (!value) return fallback
  return ['true', '1', 'si', 'sí', 'activo', 'active', 'yes'].includes(normalizeText(value))
}

function getNavIcon(view: View) {
  const className = 'h-4 w-4 shrink-0'
  if (view === 'pos') return <ShoppingCart className={className} />
  if (view === 'movements') return <History className={className} />
  if (view === 'production') return <Factory className={className} />
  if (view === 'customers') return <Users className={className} />
  return <Settings className={className} />
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, index) => {
        if (line.startsWith('### ')) return <h4 key={index} className="mt-3 text-sm font-semibold">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={index} className="mt-3 text-base font-semibold">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={index} className="mt-4 text-lg font-bold">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={index} className="ml-4 list-disc text-sm">{line.slice(2)}</li>
        if (/^\d+\.\s/.test(line)) return <li key={index} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\.\s/, '')}</li>
        if (!line.trim()) return <div key={index} className="h-1" />
        return <p key={index} className="text-sm">{line}</p>
      })}
    </div>
  )
}

function StatusBadge({ status, labels }: { status: string; labels?: Record<string, string> }) {
  const defaultLabel = status === 'confirmed' ? 'Confirmada' : status === 'cancelled' ? 'Anulada' : status === 'draft' ? 'Borrador' : status === 'in_progress' ? 'En proceso' : status === 'planned' ? 'Programada' : status === 'completed' ? 'Completada' : 'Pendiente'
  const label = labels?.[status] ?? defaultLabel
  const tone = status === 'confirmed' || status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : status === 'cancelled' ? 'bg-destructive/10 text-destructive' : status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
  return <Badge className={`border-0 ${tone}`}>{label}</Badge>
}

function NoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  const tone = notice.tone === 'success' ? 'border-emerald-300/70 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100' : notice.tone === 'warning' ? 'border-amber-300/70 bg-amber-50/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100' : notice.tone === 'error' ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-primary/20 bg-primary/5 text-foreground'
  const Icon = notice.tone === 'success' ? CheckCircle2 : notice.tone === 'warning' ? TriangleAlert : notice.tone === 'error' ? AlertCircle : Info
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${tone}`} role="status">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1"><p className="font-semibold">{notice.title}</p><p className="mt-0.5 text-xs opacity-85">{notice.message}</p></div>
      <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Cerrar aviso" className="-mr-2 -mt-2 h-11 w-11"><X className="h-4 w-4" /></Button>
    </div>
  )
}

function EmptyState({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 px-6 py-8 text-center"><div className="mb-3 rounded-xl bg-muted p-3 text-muted-foreground">{icon}</div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>{action ? <div className="mt-4">{action}</div> : null}</div>
}

export default function Page() {
  const [state, setState] = useState<AppState>(() => createSeedState())
  const [activeView, setActiveView] = useState<View>('pos')
  const [adminTab, setAdminTab] = useState<AdminTab>('catalog')
  const [movementTab, setMovementTab] = useState<MovementTab>('sales')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [hydrated, setHydrated] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const [posSearch, setPosSearch] = useState('')
  const [posCategory, setPosCategory] = useState('Todos')
  const [cartLines, setCartLines] = useState<CartLine[]>(() => createSeedState().activeCart.lines)
  const [cartCustomerId, setCartCustomerId] = useState('')
  const [cartDiscountInput, setCartDiscountInput] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo')
  const [receivedInput, setReceivedInput] = useState('0')
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false)

  const [movementSearch, setMovementSearch] = useState('')
  const [movementStatus, setMovementStatus] = useState('all')
  const [selectedMovement, setSelectedMovement] = useState<{ type: MovementTab; id: string } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ kind: 'reverse' | 'restore' | 'complete'; id: string } | null>(null)

  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [purchaseSupplierId, setPurchaseSupplierId] = useState('')
  const [purchaseReference, setPurchaseReference] = useState('')
  const [purchaseLines, setPurchaseLines] = useState<PurchaseDraftLine[]>([{ itemId: '', itemKind: 'ingredient', quantity: '1', unitCost: '0' }])
  const [purchaseMode, setPurchaseMode] = useState<'draft' | 'confirmed'>('confirmed')

  const [selectedProductionId, setSelectedProductionId] = useState('production-028')
  const [productionDialogOpen, setProductionDialogOpen] = useState(false)
  const [productionProductId, setProductionProductId] = useState('product-pan')
  const [productionTarget, setProductionTarget] = useState('20')
  const [productionNotes, setProductionNotes] = useState('')
  const [actualConsumption, setActualConsumption] = useState<Record<string, string>>({})
  const [actualOutput, setActualOutput] = useState('')

  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('customer-maria')
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [customerEditingId, setCustomerEditingId] = useState('')
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', notes: '', customFields: {} as CustomFieldValues })

  const [catalogMode, setCatalogMode] = useState<'products' | 'ingredients' | 'recipes' | 'suppliers'>('products')
  const [catalogDialogType, setCatalogDialogType] = useState<CatalogDialogType>(null)
  const [catalogEditingId, setCatalogEditingId] = useState('')
  const [catalogForm, setCatalogForm] = useState({ code: '', name: '', category: 'Panadería', unit: 'pieza', price: '', cost: '', stock: '', minStock: '', phone: '', email: '', notes: '', productId: '', yield: '1', customFields: {} as CustomFieldValues })
  const [recipeLines, setRecipeLines] = useState<{ ingredientId: string; quantity: string }[]>([{ ingredientId: '', quantity: '1' }])
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [adjustItem, setAdjustItem] = useState<{ kind: 'product' | 'ingredient'; id: string } | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('0')
  const [adjustReason, setAdjustReason] = useState('')

  const [purchaseCustomFields, setPurchaseCustomFields] = useState<CustomFieldValues>({})
  const [productionCustomFields, setProductionCustomFields] = useState<CustomFieldValues>({})
  const [preferenceSection, setPreferenceSection] = useState<'identity' | 'appearance' | 'navigation' | 'pos' | 'fields' | 'formats' | 'receipt' | 'dashboard' | 'profiles'>('identity')
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [profileEditingId, setProfileEditingId] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', pin: '', active: true, permissions: { admin: false, reversals: false, imports: false, inventory: false, production: false } as Record<PermissionKey, boolean> })
  const [switchProfileOpen, setSwitchProfileOpen] = useState(false)
  const [switchProfileId, setSwitchProfileId] = useState('')
  const [switchPin, setSwitchPin] = useState('')
  const [templateInputOpen, setTemplateInputOpen] = useState(false)
  const [templatePreview, setTemplatePreview] = useState<{ fileName: string; template: ConfigurationTemplate } | null>(null)
  const [defaultsPreviewOpen, setDefaultsPreviewOpen] = useState(false)
  const [customFieldEntity, setCustomFieldEntity] = useState<CustomFieldEntity>('products')
  const [customFieldEditingId, setCustomFieldEditingId] = useState('')
  const [customFieldForm, setCustomFieldForm] = useState({ label: '', type: 'text' as CustomFieldType, options: '', active: true })
  const [newCategory, setNewCategory] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [selectedImportTemplateId, setSelectedImportTemplateId] = useState('')
  const [logoInputRef] = useState(() => ({ current: null as HTMLInputElement | null }))

  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1)
  const [importFileName, setImportFileName] = useState('')
  const [importRows, setImportRows] = useState<Record<string, string>[]>([])
  const [importHeaders, setImportHeaders] = useState<string[]>([])
  const [importModule, setImportModule] = useState<ImportModule>('products')
  const [importMapping, setImportMapping] = useState<Record<string, string>>({})
  const [importValidation, setImportValidation] = useState<ImportValidation | null>(null)
  const [importPrepared, setImportPrepared] = useState<ImportPreparedRow[]>([])
  const [importErrors, setImportErrors] = useState<ImportError[]>([])
  const [importConflicts, setImportConflicts] = useState<ImportConflict[]>([])
  const [importResultMessage, setImportResultMessage] = useState('')
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [restorePreview, setRestorePreview] = useState<{ fileName: string; snapshot: AppState } | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const configInputRef = useRef<HTMLInputElement>(null)
  const logoUploadRef = useRef<HTMLInputElement>(null)

  const [activeAgentId] = useState('local-engine')

  useEffect(() => {
    let mounted = true
    loadLocalState().then((saved) => {
      if (!mounted) return
      const migrated = saved ? migrateAppState(saved) : createSeedState()
      setState(migrated)
      setCartLines(migrated.activeCart?.lines ?? [])
      setCartCustomerId(migrated.activeCart?.customerId ?? '')
      setCartDiscountInput(String((migrated.activeCart?.discountCents ?? 0) / 100))
      if (!saved) saveLocalState(migrated).catch(() => undefined)
      setHydrated(true)
    }).catch((error: Error) => {
      if (!mounted) return
      setStorageError(error.message)
      setHydrated(true)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const mode = state.settings.themeMode
    const applyTheme = (isDark: boolean) => {
      setTheme(isDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', isDark)
    }
    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(media.matches)
      const listener = (event: MediaQueryListEvent) => applyTheme(event.matches)
      media.addEventListener?.('change', listener)
      return () => media.removeEventListener?.('change', listener)
    }
    applyTheme(mode === 'dark')
  }, [state.settings.themeMode])

  useEffect(() => {
    if (!hydrated || storageError) return
    saveLocalState(state).catch((error: Error) => setStorageError(error.message))
  }, [state, hydrated, storageError])

  const commit = (updater: (previous: AppState) => AppState) => {
    setState((previous) => ({ ...updater(previous), lastSavedAt: nowIso() }))
  }

  const currency = state.settings.currency
  const cartSubtotal = useMemo(() => cartLines.reduce((sum, line) => {
    const product = state.products.find((item) => item.id === line.productId)
    return sum + (product?.priceCents ?? 0) * line.quantity
  }, 0), [cartLines, state.products])
  const cartDiscountCents = Math.min(cartSubtotal, parseMoneyInput(cartDiscountInput))
  const cartTaxCents = Math.round((cartSubtotal - cartDiscountCents) * (state.settings.taxRate / 100))
  const cartTotal = Math.max(0, cartSubtotal - cartDiscountCents + cartTaxCents)
  const receivedCents = parseMoneyInput(receivedInput)
  const changeCents = Math.max(0, receivedCents - cartTotal)
  const paymentComplete = paymentMethod !== 'Efectivo' || receivedCents >= cartTotal

  const productsForPos = useMemo(() => {
    const search = normalizeText(posSearch)
    const order = new Map(state.settings.pos.productOrder.map((id, index) => [id, index]))
    return state.products.filter((product) => {
      const matchesCategory = posCategory === 'Todos' || product.category === posCategory
      const searchableText = normalizeText(`${product.name}${product.code}${product.category}`)
      const matchesSearch = !search || searchableText.includes(search)
      return product.active && matchesCategory && matchesSearch
    }).sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999))
  }, [posCategory, posSearch, state.products, state.settings.pos.productOrder])
  const filteredSales = useMemo(() => {
    const search = normalizeText(movementSearch)
    return state.sales.filter((sale) => (movementStatus === 'all' || sale.status === movementStatus) && (!search || normalizeText(`${sale.folio}${sale.customerId}${sale.paymentMethod}`).includes(search))).sort((a, b) => b.date.localeCompare(a.date))
  }, [movementSearch, movementStatus, state.sales])
  const filteredPurchases = useMemo(() => {
    const search = normalizeText(movementSearch)
    return state.purchases.filter((purchase) => (movementStatus === 'all' || purchase.status === movementStatus) && (!search || normalizeText(`${purchase.folio}${purchase.reference}${purchase.supplierId}`).includes(search))).sort((a, b) => b.date.localeCompare(a.date))
  }, [movementSearch, movementStatus, state.purchases])
  const filteredCustomers = useMemo(() => {
    const search = normalizeText(customerSearch)
    return state.customers.filter((customer) => !search || normalizeText(`${customer.name}${customer.phone}${customer.email}`).includes(search)).sort((a, b) => a.name.localeCompare(b.name))
  }, [customerSearch, state.customers])
  const selectedProduction = state.productionOrders.find((order) => order.id === selectedProductionId) ?? state.productionOrders[0]
  const selectedCustomer = state.customers.find((customer) => customer.id === selectedCustomerId) ?? null
  const selectedMovementSale = selectedMovement?.type === 'sales' ? state.sales.find((sale) => sale.id === selectedMovement.id) : null
  const selectedMovementPurchase = selectedMovement?.type === 'purchases' ? state.purchases.find((purchase) => purchase.id === selectedMovement.id) : null
  const selectedAdjustItem = adjustItem?.kind === 'product' ? state.products.find((item) => item.id === adjustItem.id) : adjustItem?.kind === 'ingredient' ? state.ingredients.find((item) => item.id === adjustItem.id) : null
  const activeAdminModule = importModules.find((module) => module.value === importModule) ?? importModules[0]

  const showNotice = (next: Notice) => {
    setNotice(next)
    window.setTimeout(() => setNotice((current) => current === next ? null : current), 5200)
  }

  const updateActiveCart = (lines: CartLine[], customerId = cartCustomerId, discountCents = parseMoneyInput(cartDiscountInput)) => {
    setCartLines(lines)
    setCartCustomerId(customerId)
    setCartDiscountInput(String(discountCents / 100))
    commit((previous) => ({ ...previous, activeCart: { lines, customerId, discountCents } }))
  }

  const addToCart = (product: Product) => {
    const existing = cartLines.find((line) => line.productId === product.id)
    const nextQuantity = (existing?.quantity ?? 0) + 1
    if (!state.settings.allowNegativeStock && nextQuantity > product.stock) {
      showNotice({ tone: 'warning', title: 'Existencia insuficiente', message: `${product.name} tiene ${formatQuantity(product.stock)} ${product.unit} disponibles.` })
      return
    }
    const nextLines = existing ? cartLines.map((line) => line.productId === product.id ? { ...line, quantity: nextQuantity } : line) : [...cartLines, { productId: product.id, quantity: 1 }]
    updateActiveCart(nextLines)
  }

  const adjustCartQuantity = (productId: string, delta: number) => {
    const product = state.products.find((item) => item.id === productId)
    const current = cartLines.find((line) => line.productId === productId)?.quantity ?? 0
    const nextQuantity = current + delta
    if (product && nextQuantity > product.stock && !state.settings.allowNegativeStock) {
      showNotice({ tone: 'warning', title: 'Límite de existencia', message: `No puedes vender más de ${formatQuantity(product.stock)} ${product.unit} de ${product.name}.` })
      return
    }
    updateActiveCart(nextQuantity <= 0 ? cartLines.filter((line) => line.productId !== productId) : cartLines.map((line) => line.productId === productId ? { ...line, quantity: nextQuantity } : line))
  }

  const updateCartCustomer = (customerId: string) => updateActiveCart(cartLines, customerId)
  const updateCartDiscount = (value: string) => {
    setCartDiscountInput(value)
    commit((previous) => ({ ...previous, activeCart: { ...previous.activeCart, discountCents: Math.min(cartSubtotal, parseMoneyInput(value)) } }))
  }

  const clearCart = () => {
    updateActiveCart([], '', 0)
    setReceivedInput('0')
    showNotice({ tone: 'info', title: 'Venta cancelada', message: 'El carrito se vació sin modificar existencias.' })
  }

  const suspendCart = () => {
    if (cartLines.length === 0) {
      showNotice({ tone: 'warning', title: 'Carrito vacío', message: 'Agrega al menos un producto antes de suspender la venta.' })
      return
    }
    const draft: DraftCart = { id: makeId('held'), createdAt: nowIso(), lines: cartLines, customerId: cartCustomerId, discountCents: cartDiscountCents }
    commit((previous) => ({ ...previous, heldCarts: [draft, ...previous.heldCarts], activeCart: { lines: [], customerId: '', discountCents: 0 } }))
    setCartLines([])
    setCartCustomerId('')
    setCartDiscountInput('0')
    setReceivedInput('0')
    showNotice({ tone: 'success', title: 'Venta suspendida', message: 'El carrito quedó guardado localmente para retomarlo después.' })
  }

  const resumeCart = (draft: DraftCart) => {
    updateActiveCart(draft.lines, draft.customerId, draft.discountCents)
    commit((previous) => ({ ...previous, heldCarts: previous.heldCarts.filter((item) => item.id !== draft.id) }))
    setResumeDialogOpen(false)
    showNotice({ tone: 'success', title: 'Venta retomada', message: 'El carrito suspendido está listo para continuar.' })
  }

  const confirmSale = () => {
    if (!state.settings.pos.enabledPaymentMethods.includes(paymentMethod)) {
      showNotice({ tone: 'warning', title: 'Método no disponible', message: 'Activa este método en Administración → Ajustes → Punto de venta.' })
      return
    }
    if (cartLines.length === 0) {
      showNotice({ tone: 'warning', title: 'Carrito vacío', message: 'Agrega productos antes de cobrar.' })
      return
    }
    if (!paymentComplete) {
      showNotice({ tone: 'warning', title: 'Pago incompleto', message: 'El monto recibido debe cubrir el total para confirmar la venta.' })
      return
    }
    const saleId = makeId('sale')
    const date = nowIso()
    const folio = `${state.settings.folioPrefixes.sale}${state.settings.nextSaleNumber}`
    const lines: SaleLine[] = cartLines.flatMap((line) => {
      const product = state.products.find((item) => item.id === line.productId)
      return product ? [{ productId: product.id, code: product.code, name: product.name, quantity: line.quantity, unitPriceCents: product.priceCents, totalCents: product.priceCents * line.quantity }] : []
    })
    if (lines.length !== cartLines.length) {
      showNotice({ tone: 'error', title: 'Producto no disponible', message: 'Actualiza el carrito antes de cobrar.' })
      return
    }
    const sale: Sale = { ...makeSeedMeta(saleId, false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', folio, date, customerId: cartCustomerId, lines, subtotalCents: cartSubtotal, discountCents: cartDiscountCents, taxCents: cartTaxCents, totalCents: cartTotal, paymentMethod, receivedCents: paymentMethod === 'Efectivo' ? receivedCents : cartTotal, changeCents: paymentMethod === 'Efectivo' ? changeCents : 0, status: 'confirmed' }
    const saleMovements: InventoryMovement[] = []
    const nextProducts = state.products.map((product) => {
      const line = lines.find((item) => item.productId === product.id)
      if (!line) return product
      const beforeStock = product.stock
      const afterStock = beforeStock - line.quantity
      saleMovements.push({ ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', date, entityType: 'product', itemId: product.id, itemName: product.name, quantity: -line.quantity, beforeStock, afterStock, sourceType: 'sale', sourceId: saleId, note: `Venta ${folio}` })
      return { ...product, stock: afterStock, updatedAt: date, version: product.version + 1, syncStatus: 'pending' as const }
    })
    if (!state.settings.allowNegativeStock && nextProducts.some((product) => product.stock < 0)) {
      showNotice({ tone: 'error', title: 'Existencia insuficiente', message: 'La venta no se aplicó porque una existencia quedaría negativa.' })
      return
    }
    commit((previous) => ({ ...previous, products: nextProducts, sales: [sale, ...previous.sales], inventoryMovements: [...saleMovements, ...previous.inventoryMovements], settings: { ...previous.settings, nextSaleNumber: previous.settings.nextSaleNumber + 1 }, activeCart: { lines: [], customerId: '', discountCents: 0 } }))
    setCartLines([])
    setCartCustomerId('')
    setCartDiscountInput('0')
    setReceivedInput('0')
    setReceiptSale(sale)
    showNotice({ tone: 'success', title: `Venta ${folio} confirmada`, message: 'El inventario se actualizó en una operación local.' })
  }

  const openNewPurchase = () => {
    setPurchaseSupplierId('')
    setPurchaseReference('')
    setPurchaseMode('confirmed')
    setPurchaseCustomFields({})
    setPurchaseLines([{ itemId: '', itemKind: 'ingredient', quantity: '1', unitCost: '0' }])
    setPurchaseDialogOpen(true)
  }

  const purchaseTotalCents = purchaseLines.reduce((sum, line) => sum + parseMoneyInput(line.quantity) / 100 * parseMoneyInput(line.unitCost), 0)
  const updatePurchaseLine = (index: number, patch: Partial<PurchaseDraftLine>) => setPurchaseLines((lines) => lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line))

  const savePurchase = () => {
    if (!requirePermission('inventory', 'registrar compras')) return
    const validLines = purchaseLines.flatMap((line) => {
      const item = line.itemKind === 'product' ? state.products.find((product) => product.id === line.itemId) : state.ingredients.find((ingredient) => ingredient.id === line.itemId)
      const quantity = Number(line.quantity)
      const unitCostCents = parseMoneyInput(line.unitCost)
      return item && Number.isFinite(quantity) && quantity > 0 ? [{ itemId: item.id, itemKind: line.itemKind, code: item.code, name: item.name, quantity, unitCostCents, totalCents: unitCostCents * quantity }] : []
    })
    if (validLines.length === 0) {
      showNotice({ tone: 'warning', title: 'Compra sin líneas', message: 'Selecciona al menos un producto o insumo con cantidad válida.' })
      return
    }
    const purchaseId = makeId('purchase')
    const date = nowIso()
    const purchase: Purchase = { ...makeSeedMeta(purchaseId, false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', folio: `${state.settings.folioPrefixes.purchase}${state.settings.nextPurchaseNumber}`, date, supplierId: purchaseSupplierId, reference: purchaseReference.trim(), lines: validLines, totalCents: validLines.reduce((sum, line) => sum + line.totalCents, 0), status: purchaseMode, customFields: purchaseCustomFields }
    if (purchaseMode === 'draft') {
      commit((previous) => ({ ...previous, purchases: [purchase, ...previous.purchases], settings: { ...previous.settings, nextPurchaseNumber: previous.settings.nextPurchaseNumber + 1 } }))
    } else {
      const movementDate = date
      const nextProducts = state.products.map((product) => {
        const lines = validLines.filter((line) => line.itemKind === 'product' && line.itemId === product.id)
        if (lines.length === 0) return product
        const quantity = lines.reduce((sum, line) => sum + line.quantity, 0)
        return { ...product, stock: product.stock + quantity, costCents: lines[lines.length - 1].unitCostCents, updatedAt: movementDate, version: product.version + 1, syncStatus: 'pending' as const }
      })
      const nextIngredients = state.ingredients.map((ingredient) => {
        const lines = validLines.filter((line) => line.itemKind === 'ingredient' && line.itemId === ingredient.id)
        if (lines.length === 0) return ingredient
        const quantity = lines.reduce((sum, line) => sum + line.quantity, 0)
        return { ...ingredient, stock: ingredient.stock + quantity, costCents: lines[lines.length - 1].unitCostCents, updatedAt: movementDate, version: ingredient.version + 1, syncStatus: 'pending' as const }
      })
      const movements = validLines.map((line) => {
        const source = line.itemKind === 'product' ? state.products.find((item) => item.id === line.itemId) : state.ingredients.find((item) => item.id === line.itemId)
        return { ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending' as const, date, entityType: line.itemKind, itemId: line.itemId, itemName: line.name, quantity: line.quantity, beforeStock: source?.stock ?? 0, afterStock: (source?.stock ?? 0) + line.quantity, sourceType: 'purchase' as const, sourceId: purchaseId, note: `Compra ${purchase.folio}` }
      })
      commit((previous) => ({ ...previous, purchases: [purchase, ...previous.purchases], products: nextProducts, ingredients: nextIngredients, inventoryMovements: [...movements, ...previous.inventoryMovements], settings: { ...previous.settings, nextPurchaseNumber: previous.settings.nextPurchaseNumber + 1 } }))
    }
    setPurchaseDialogOpen(false)
    showNotice({ tone: 'success', title: `Compra ${purchase.folio} guardada`, message: purchaseMode === 'confirmed' ? 'Las existencias se incrementaron y la trazabilidad quedó registrada.' : 'El borrador quedó disponible en Movimientos.' })
  }

  const reverseMovement = (kind: MovementTab, id: string) => {
    if (!requirePermission('reversals', 'hacer reversos')) return
    const date = nowIso()
    if (kind === 'sales') {
      const sale = state.sales.find((item) => item.id === id)
      if (!sale || sale.status !== 'confirmed') return
      const reversalMovements: InventoryMovement[] = []
      const nextProducts = state.products.map((product) => {
        const line = sale.lines.find((item) => item.productId === product.id)
        if (!line) return product
        const beforeStock = product.stock
        const afterStock = beforeStock + line.quantity
        reversalMovements.push({ ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', date, entityType: 'product', itemId: product.id, itemName: product.name, quantity: line.quantity, beforeStock, afterStock, sourceType: 'reversal', sourceId: sale.id, note: `Reverso de ${sale.folio}` })
        return { ...product, stock: afterStock, updatedAt: date, version: product.version + 1, syncStatus: 'pending' as const }
      })
      commit((previous) => ({ ...previous, sales: previous.sales.map((item) => item.id === id ? { ...item, status: 'cancelled', reversedAt: date, updatedAt: date, version: item.version + 1, syncStatus: 'pending' } : item), products: nextProducts, inventoryMovements: [...reversalMovements, ...previous.inventoryMovements] }))
      showNotice({ tone: 'success', title: `${sale.folio} anulada`, message: 'Se creó un movimiento de reverso; el historial original permanece intacto.' })
    } else {
      const purchase = state.purchases.find((item) => item.id === id)
      if (!purchase || purchase.status !== 'confirmed') return
      const nextProducts = state.products.map((product) => {
        const quantity = purchase.lines.filter((line) => line.itemKind === 'product' && line.itemId === product.id).reduce((sum, line) => sum + line.quantity, 0)
        return quantity ? { ...product, stock: product.stock - quantity, updatedAt: date, version: product.version + 1, syncStatus: 'pending' as const } : product
      })
      const nextIngredients = state.ingredients.map((ingredient) => {
        const quantity = purchase.lines.filter((line) => line.itemKind === 'ingredient' && line.itemId === ingredient.id).reduce((sum, line) => sum + line.quantity, 0)
        return quantity ? { ...ingredient, stock: ingredient.stock - quantity, updatedAt: date, version: ingredient.version + 1, syncStatus: 'pending' as const } : ingredient
      })
      const reversalMovements = purchase.lines.map((line) => {
        const source = line.itemKind === 'product' ? state.products.find((item) => item.id === line.itemId) : state.ingredients.find((item) => item.id === line.itemId)
        return { ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending' as const, date, entityType: line.itemKind, itemId: line.itemId, itemName: line.name, quantity: -line.quantity, beforeStock: source?.stock ?? 0, afterStock: (source?.stock ?? 0) - line.quantity, sourceType: 'reversal' as const, sourceId: purchase.id, note: `Reverso de ${purchase.folio}` }
      })
      commit((previous) => ({ ...previous, purchases: previous.purchases.map((item) => item.id === id ? { ...item, status: 'cancelled', reversedAt: date, updatedAt: date, version: item.version + 1, syncStatus: 'pending' } : item), products: nextProducts, ingredients: nextIngredients, inventoryMovements: [...reversalMovements, ...previous.inventoryMovements] }))
      showNotice({ tone: 'success', title: `${purchase.folio} anulada`, message: 'El ajuste inverso quedó registrado sin borrar el movimiento original.' })
    }
    setConfirmAction(null)
    setSelectedMovement(null)
  }

  const startProduction = (order: ProductionOrder) => {
    if (!requirePermission('production', 'iniciar producción')) return
    if (order.status !== 'planned') return
    const date = nowIso()
    commit((previous) => ({ ...previous, productionOrders: previous.productionOrders.map((item) => item.id === order.id ? { ...item, status: 'in_progress', startedAt: date, updatedAt: date, version: item.version + 1, syncStatus: 'pending' } : item) }))
    showNotice({ tone: 'success', title: `${order.folio} iniciada`, message: 'Registra los consumos reales antes de completar la orden.' })
  }

  const completeProduction = (order: ProductionOrder) => {
    if (!requirePermission('production', 'completar producción')) return
    const output = Number(actualOutput || order.actualOutput || order.plannedOutput)
    if (!Number.isFinite(output) || output <= 0) {
      showNotice({ tone: 'warning', title: 'Producción inválida', message: 'Indica una cantidad producida mayor que cero.' })
      return
    }
    const date = nowIso()
    const actualRequirements = order.requirements.map((requirement) => ({ ...requirement, actual: Number(actualConsumption[requirement.ingredientId] ?? requirement.actual ?? requirement.planned) }))
    if (actualRequirements.some((requirement) => !Number.isFinite(requirement.actual) || requirement.actual < 0)) {
      showNotice({ tone: 'warning', title: 'Consumo inválido', message: 'Revisa las cantidades reales de cada insumo.' })
      return
    }
    const nextIngredients = state.ingredients.map((ingredient) => {
      const requirement = actualRequirements.find((item) => item.ingredientId === ingredient.id)
      if (!requirement) return ingredient
      return { ...ingredient, stock: ingredient.stock - requirement.actual, updatedAt: date, version: ingredient.version + 1, syncStatus: 'pending' as const }
    })
    const product = state.products.find((item) => item.id === order.productId)
    const nextProducts = state.products.map((item) => item.id === order.productId ? { ...item, stock: item.stock + output, updatedAt: date, version: item.version + 1, syncStatus: 'pending' as const } : item)
    if (!state.settings.allowNegativeStock && nextIngredients.some((ingredient) => ingredient.stock < 0)) {
      showNotice({ tone: 'error', title: 'Insumo insuficiente', message: 'La orden no se completó porque un consumo dejaría existencias negativas.' })
      return
    }
    const movements: InventoryMovement[] = actualRequirements.map((requirement) => {
      const source = state.ingredients.find((item) => item.id === requirement.ingredientId)
      return { ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', date, entityType: 'ingredient', itemId: requirement.ingredientId, itemName: requirement.name, quantity: -requirement.actual, beforeStock: source?.stock ?? 0, afterStock: (source?.stock ?? 0) - requirement.actual, sourceType: 'production', sourceId: order.id, note: `Consumo ${order.folio}` }
    })
    if (product) movements.push({ ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', date, entityType: 'product', itemId: product.id, itemName: product.name, quantity: output, beforeStock: product.stock, afterStock: product.stock + output, sourceType: 'production', sourceId: order.id, note: `Rendimiento ${order.folio}` })
    commit((previous) => ({ ...previous, ingredients: nextIngredients, products: nextProducts, productionOrders: previous.productionOrders.map((item) => item.id === order.id ? { ...item, actualOutput: output, requirements: actualRequirements, status: 'completed', completedAt: date, updatedAt: date, version: item.version + 1, syncStatus: 'pending' } : item), inventoryMovements: [...movements, ...previous.inventoryMovements] }))
    setConfirmAction(null)
    setActualOutput('')
    showNotice({ tone: 'success', title: `${order.folio} completada`, message: 'Consumos y producto terminado se aplicaron en una sola operación local.' })
  }

  const createProduction = () => {
    if (!requirePermission('production', 'crear órdenes de producción')) return
    const product = state.products.find((item) => item.id === productionProductId)
    const recipe = state.recipes.find((item) => item.productId === productionProductId)
    const target = Number(productionTarget)
    if (!product || !recipe || !Number.isFinite(target) || target <= 0) {
      showNotice({ tone: 'warning', title: 'Orden incompleta', message: 'Selecciona un producto con receta y una cantidad objetivo válida.' })
      return
    }
    const date = nowIso()
    const multiplier = target / recipe.yieldQuantity
    const requirements = recipe.lines.map((line) => {
      const ingredient = state.ingredients.find((item) => item.id === line.ingredientId)
      return { ingredientId: line.ingredientId, name: ingredient?.name ?? 'Insumo', unit: line.unit, planned: line.quantity * multiplier, actual: 0 }
    })
    const order: ProductionOrder = { ...makeSeedMeta(makeId('production'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', folio: `${state.settings.folioPrefixes.production}${String(state.settings.nextProductionNumber).padStart(3, '0')}`, productId: product.id, productName: product.name, plannedOutput: target, actualOutput: 0, scheduledAt: date, status: 'planned', requirements, notes: productionNotes.trim(), customFields: productionCustomFields }
    commit((previous) => ({ ...previous, productionOrders: [order, ...previous.productionOrders], settings: { ...previous.settings, nextProductionNumber: previous.settings.nextProductionNumber + 1 } }))
    setSelectedProductionId(order.id)
    setProductionDialogOpen(false)
    showNotice({ tone: 'success', title: `${order.folio} creada`, message: 'La orden está lista para iniciar cuando los insumos estén disponibles.' })
  }

  const openCustomerEditor = (customer?: Customer) => {
    setCustomerEditingId(customer?.id ?? '')
    setCustomerForm(customer ? { name: customer.name, phone: customer.phone, email: customer.email, notes: customer.notes, customFields: customer.customFields ?? {} } : { name: '', phone: '', email: '', notes: '', customFields: {} })
    setCustomerDialogOpen(true)
  }

  const saveCustomer = () => {
    if (!customerForm.name.trim()) {
      showNotice({ tone: 'warning', title: 'Nombre requerido', message: 'Escribe el nombre del cliente para continuar.' })
      return
    }
    const date = nowIso()
    if (customerEditingId) {
      commit((previous) => ({ ...previous, customers: previous.customers.map((customer) => customer.id === customerEditingId ? { ...customer, ...customerForm, updatedAt: date, version: customer.version + 1, syncStatus: 'pending' } : customer) }))
      showNotice({ tone: 'success', title: 'Cliente actualizado', message: 'Los datos quedaron guardados en este dispositivo.' })
    } else {
      const customer: Customer = { ...makeSeedMeta(makeId('customer'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', ...customerForm, active: true }
      commit((previous) => ({ ...previous, customers: [customer, ...previous.customers] }))
      setSelectedCustomerId(customer.id)
      showNotice({ tone: 'success', title: 'Cliente creado', message: 'Ya puedes asociarlo a una venta desde Punto de venta.' })
    }
    setCustomerDialogOpen(false)
  }

  const startSaleForCustomer = (customerId: string) => {
    setCartCustomerId(customerId)
    updateActiveCart(cartLines, customerId)
    setActiveView('pos')
    showNotice({ tone: 'info', title: 'Cliente preseleccionado', message: 'La siguiente venta se asociará a este cliente.' })
  }

  const openCatalogEditor = (type: Exclude<CatalogDialogType, null>, id = '') => {
    setCatalogDialogType(type)
    setCatalogEditingId(id)
    setRecipeLines([{ ingredientId: '', quantity: '1' }])
    if (type === 'product') {
      const product = state.products.find((item) => item.id === id)
      setCatalogForm(product ? { code: product.code, name: product.name, category: product.category, unit: product.unit, price: String(product.priceCents / 100), cost: String(product.costCents / 100), stock: String(product.stock), minStock: String(product.minStock), phone: '', email: '', notes: '', productId: '', yield: '1', customFields: product.customFields ?? {} } : { code: '', name: '', category: 'Panadería', unit: 'pieza', price: '', cost: '', stock: '0', minStock: '0', phone: '', email: '', notes: '', productId: '', yield: '1', customFields: {} })
    } else if (type === 'ingredient') {
      const ingredient = state.ingredients.find((item) => item.id === id)
      setCatalogForm(ingredient ? { code: ingredient.code, name: ingredient.name, category: '', unit: ingredient.unit, price: '', cost: String(ingredient.costCents / 100), stock: String(ingredient.stock), minStock: String(ingredient.minStock), phone: '', email: '', notes: '', productId: '', yield: '1', customFields: {} } : { code: '', name: '', category: '', unit: 'kg', price: '', cost: '', stock: '0', minStock: '0', phone: '', email: '', notes: '', productId: '', yield: '1', customFields: {} })
    } else if (type === 'supplier') {
      const supplier = state.suppliers.find((item) => item.id === id)
      setCatalogForm(supplier ? { code: '', name: supplier.name, category: '', unit: '', price: '', cost: '', stock: '', minStock: '', phone: supplier.phone, email: supplier.email, notes: supplier.notes, productId: '', yield: '1', customFields: {} } : { code: '', name: '', category: '', unit: '', price: '', cost: '', stock: '', minStock: '', phone: '', email: '', notes: '', productId: '', yield: '1', customFields: {} })
    } else {
      const recipe = state.recipes.find((item) => item.id === id)
      setCatalogForm({ code: '', name: '', category: '', unit: '', price: '', cost: '', stock: '', minStock: '', phone: '', email: '', notes: '', productId: recipe?.productId ?? state.products[0]?.id ?? '', yield: String(recipe?.yieldQuantity ?? 1), customFields: {} })
      if (recipe) setRecipeLines(recipe.lines.map((line) => ({ ingredientId: line.ingredientId, quantity: String(line.quantity) })))
    }
  }

  const saveCatalogItem = () => {
    if (!requirePermission('admin', 'editar el catálogo')) return
    const date = nowIso()
    if (catalogDialogType === 'product') {
      if (!catalogForm.code.trim() || !catalogForm.name.trim()) {
        showNotice({ tone: 'warning', title: 'Código y nombre requeridos', message: 'Completa los datos principales del producto.' })
        return
      }
      if (catalogEditingId) commit((previous) => ({ ...previous, products: previous.products.map((product) => product.id === catalogEditingId ? { ...product, code: catalogForm.code.trim(), name: catalogForm.name.trim(), category: catalogForm.category, unit: catalogForm.unit, priceCents: parseMoneyInput(catalogForm.price), costCents: parseMoneyInput(catalogForm.cost), minStock: Number(catalogForm.minStock) || 0, customFields: catalogForm.customFields, updatedAt: date, version: product.version + 1, syncStatus: 'pending' } : product) }))
      else { const product: Product = { ...makeSeedMeta(makeId('product'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', code: catalogForm.code.trim(), name: catalogForm.name.trim(), category: catalogForm.category || 'General', unit: catalogForm.unit || 'pieza', priceCents: parseMoneyInput(catalogForm.price), costCents: parseMoneyInput(catalogForm.cost), stock: Number(catalogForm.stock) || 0, minStock: Number(catalogForm.minStock) || 0, active: true, customFields: catalogForm.customFields }; commit((previous) => ({ ...previous, products: [product, ...previous.products], settings: { ...previous.settings, pos: { ...previous.settings.pos, productOrder: [product.id, ...previous.settings.pos.productOrder] } } })) }
      showNotice({ tone: 'success', title: catalogEditingId ? 'Producto actualizado' : 'Producto creado', message: 'El catálogo local se actualizó.' })
    } else if (catalogDialogType === 'ingredient') {
      if (!catalogForm.code.trim() || !catalogForm.name.trim()) {
        showNotice({ tone: 'warning', title: 'Código y nombre requeridos', message: 'Completa los datos principales del insumo.' })
        return
      }
      if (catalogEditingId) commit((previous) => ({ ...previous, ingredients: previous.ingredients.map((ingredient) => ingredient.id === catalogEditingId ? { ...ingredient, code: catalogForm.code.trim(), name: catalogForm.name.trim(), unit: catalogForm.unit, costCents: parseMoneyInput(catalogForm.cost), minStock: Number(catalogForm.minStock) || 0, updatedAt: date, version: ingredient.version + 1, syncStatus: 'pending' } : ingredient) }))
      else { const ingredient: Ingredient = { ...makeSeedMeta(makeId('ingredient'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', code: catalogForm.code.trim(), name: catalogForm.name.trim(), unit: catalogForm.unit || 'kg', costCents: parseMoneyInput(catalogForm.cost), stock: Number(catalogForm.stock) || 0, minStock: Number(catalogForm.minStock) || 0, active: true }; commit((previous) => ({ ...previous, ingredients: [ingredient, ...previous.ingredients] })) }
      showNotice({ tone: 'success', title: catalogEditingId ? 'Insumo actualizado' : 'Insumo creado', message: 'El inventario local se actualizó.' })
    } else if (catalogDialogType === 'supplier') {
      if (!catalogForm.name.trim()) {
        showNotice({ tone: 'warning', title: 'Nombre requerido', message: 'Completa el nombre del proveedor.' })
        return
      }
      if (catalogEditingId) commit((previous) => ({ ...previous, suppliers: previous.suppliers.map((supplier) => supplier.id === catalogEditingId ? { ...supplier, name: catalogForm.name.trim(), phone: catalogForm.phone.trim(), email: catalogForm.email.trim(), notes: catalogForm.notes.trim(), updatedAt: date, version: supplier.version + 1, syncStatus: 'pending' } : supplier) }))
      else { const supplier: Supplier = { ...makeSeedMeta(makeId('supplier'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', name: catalogForm.name.trim(), phone: catalogForm.phone.trim(), email: catalogForm.email.trim(), notes: catalogForm.notes.trim(), active: true }; commit((previous) => ({ ...previous, suppliers: [supplier, ...previous.suppliers] })) }
      showNotice({ tone: 'success', title: catalogEditingId ? 'Proveedor actualizado' : 'Proveedor creado', message: 'El directorio local se actualizó.' })
    } else if (catalogDialogType === 'recipe') {
      const product = state.products.find((item) => item.id === catalogForm.productId)
      const validLines = recipeLines.flatMap((line) => Number(line.quantity) > 0 && line.ingredientId ? [{ ingredientId: line.ingredientId, quantity: Number(line.quantity), unit: state.ingredients.find((item) => item.id === line.ingredientId)?.unit ?? '' }] : [])
      if (!product || validLines.length === 0 || Number(catalogForm.yield) <= 0) {
        showNotice({ tone: 'warning', title: 'Receta incompleta', message: 'Selecciona producto, rendimiento y al menos un insumo.' })
        return
      }
      if (catalogEditingId) commit((previous) => ({ ...previous, recipes: previous.recipes.map((recipe) => recipe.id === catalogEditingId ? { ...recipe, productId: product.id, yieldQuantity: Number(catalogForm.yield), lines: validLines, updatedAt: date, version: recipe.version + 1, syncStatus: 'pending' } : recipe) }))
      else { const recipe: Recipe = { ...makeSeedMeta(makeId('recipe'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', productId: product.id, yieldQuantity: Number(catalogForm.yield), lines: validLines }; commit((previous) => ({ ...previous, recipes: [recipe, ...previous.recipes] })) }
      showNotice({ tone: 'success', title: catalogEditingId ? 'Receta actualizada' : 'Receta creada', message: 'La receta quedó disponible para producción.' })
    }
    setCatalogDialogType(null)
  }

  const saveAdjustment = () => {
    if (!requirePermission('inventory', 'ajustar inventario')) return
    if (!adjustItem || !selectedAdjustItem) return
    const amount = Number(adjustAmount)
    if (!Number.isFinite(amount) || amount === 0) {
      showNotice({ tone: 'warning', title: 'Ajuste inválido', message: 'Usa una cantidad positiva para entrada o negativa para salida.' })
      return
    }
    const nextStock = selectedAdjustItem.stock + amount
    if (nextStock < 0 && !state.settings.allowNegativeStock) {
      showNotice({ tone: 'error', title: 'Existencia negativa bloqueada', message: 'Activa la opción en Preferencias o ajusta una cantidad menor.' })
      return
    }
    const date = nowIso()
    const movement: InventoryMovement = { ...makeSeedMeta(makeId('movement'), false), createdAt: date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', date, entityType: adjustItem.kind, itemId: adjustItem.id, itemName: selectedAdjustItem.name, quantity: amount, beforeStock: selectedAdjustItem.stock, afterStock: nextStock, sourceType: 'adjustment', sourceId: makeId('adjustment'), note: adjustReason.trim() || 'Ajuste manual de inventario' }
    commit((previous) => ({ ...previous, products: adjustItem.kind === 'product' ? previous.products.map((item) => item.id === adjustItem.id ? { ...item, stock: nextStock, updatedAt: date, version: item.version + 1, syncStatus: 'pending' } : item) : previous.products, ingredients: adjustItem.kind === 'ingredient' ? previous.ingredients.map((item) => item.id === adjustItem.id ? { ...item, stock: nextStock, updatedAt: date, version: item.version + 1, syncStatus: 'pending' } : item) : previous.ingredients, inventoryMovements: [movement, ...previous.inventoryMovements] }))
    setAdjustDialogOpen(false)
    showNotice({ tone: 'success', title: 'Inventario ajustado', message: 'La entrada o salida quedó auditada en Movimientos.' })
  }

  const autoMapHeaders = (headers: string[], fields: string[]) => fields.reduce<Record<string, string>>((mapping, field) => {
    const header = headers.find((candidate) => normalizeText(candidate) === normalizeText(field) || normalizeText(candidate).includes(normalizeText(field)))
    return { ...mapping, [field]: header ?? '' }
  }, {})

  const saveImportTemplate = () => {
    if (!templateName.trim()) { showNotice({ tone: 'warning', title: 'Nombre requerido', message: 'Escribe un nombre para la plantilla de mapeo.' }); return }
    const date = nowIso()
    const template: ImportTemplate = { id: selectedImportTemplateId || makeId('mapping'), name: templateName.trim(), module: importModule, mapping: { ...importMapping }, createdAt: state.settings.importTemplates.find((item) => item.id === selectedImportTemplateId)?.createdAt ?? date, updatedAt: date }
    commit((previous) => ({ ...previous, settings: { ...previous.settings, importTemplates: selectedImportTemplateId ? previous.settings.importTemplates.map((item) => item.id === selectedImportTemplateId ? template : item) : [template, ...previous.settings.importTemplates] } }))
    setSelectedImportTemplateId(template.id)
    showNotice({ tone: 'success', title: 'Plantilla guardada', message: 'Podrás volver a seleccionarla al mapear este módulo.' })
  }
  const deleteImportTemplate = (id: string) => {
    commit((previous) => ({ ...previous, settings: { ...previous.settings, importTemplates: previous.settings.importTemplates.filter((item) => item.id !== id) } }))
    if (selectedImportTemplateId === id) { setSelectedImportTemplateId(''); setTemplateName('') }
  }
  const selectImportTemplate = (id: string) => {
    const template = state.settings.importTemplates.find((item) => item.id === id)
    if (!template) { setSelectedImportTemplateId(''); setTemplateName(''); return }
    setSelectedImportTemplateId(template.id)
    setTemplateName(template.name)
    if (template.module === importModule) setImportMapping(template.mapping)
    else { setImportModule(template.module); setImportMapping(template.mapping) }
  }
  const addConfiguredCategory = () => {
    const value = newCategory.trim()
    if (!value || value === 'Todos' || state.settings.categories.includes(value)) return
    commit((previous) => ({ ...previous, settings: { ...previous.settings, categories: [...previous.settings.categories, value], pos: { ...previous.settings.pos, categories: [...previous.settings.pos.categories, { name: value, visible: true }] } } }))
    setNewCategory('')
  }
  const addConfiguredUnit = () => {
    const value = newUnit.trim()
    if (!value || state.settings.units.includes(value)) return
    updateSetting('units', [...state.settings.units, value])
    setNewUnit('')
  }

  const movePosCategory = (name: string, direction: -1 | 1) => commit((previous) => {
    const categories = [...previous.settings.pos.categories]
    const index = categories.findIndex((category) => category.name === name)
    const target = index + direction
    if (index <= 0 || target <= 0 || target >= categories.length) return previous
    const [moved] = categories.splice(index, 1)
    categories.splice(target, 0, moved)
    return { ...previous, settings: { ...previous.settings, pos: { ...previous.settings.pos, categories } } }
  })


  const handleImportFile = async (file: File) => {
    try {
      let rows: Record<string, string>[] = []
      if (file.name.toLowerCase().endsWith('.csv')) {
        rows = parseCsv(await file.text())
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        const xlsx = await import('xlsx')
        const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        rows = firstSheet ? (xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' }) as Record<string, string>[]) : []
      } else {
        showNotice({ tone: 'error', title: 'Formato no compatible', message: 'Selecciona un archivo CSV o XLSX.' })
        return
      }
      const headers = Object.keys(rows[0] ?? {})
      if (headers.length === 0 || rows.length === 0) {
        showNotice({ tone: 'warning', title: 'Archivo vacío', message: 'El archivo debe incluir encabezados y al menos una fila.' })
        return
      }
      setImportFileName(file.name)
      setImportRows(rows)
      setImportHeaders(headers)
      setImportMapping(autoMapHeaders(headers, activeAdminModule.fields))
      setImportStep(2)
      setImportValidation(null)
      setImportErrors([])
      setImportConflicts([])
      setImportResultMessage('')
      showNotice({ tone: 'success', title: 'Archivo leído localmente', message: `${rows.length} filas detectadas; nada se ha modificado todavía.` })
    } catch (error) {
      showNotice({ tone: 'error', title: 'No se pudo leer el archivo', message: error instanceof Error ? error.message : 'Verifica que el archivo no esté dañado.' })
    }
  }

  const readImportValue = (row: Record<string, string>, field: string) => String(importMapping[field] ? row[importMapping[field]] ?? '' : '').trim()

  const runImportValidation = () => {
    const errors: ImportError[] = []
    const conflicts: ImportConflict[] = []
    const prepared: ImportPreparedRow[] = []
    const counts: ImportValidation = { added: 0, updated: 0, duplicated: 0, unchanged: 0, invalid: 0, conflicts: 0 }
    const existingRecords = importModule === 'products' ? state.products : importModule === 'ingredients' ? state.ingredients : importModule === 'customers' ? state.customers : state.suppliers
    importRows.forEach((row, index) => {
      const values = activeAdminModule.fields.reduce<Record<string, string>>((record, field) => ({ ...record, [field]: readImportValue(row, field) }), {})
      const requiredFields = importModule === 'products' || importModule === 'ingredients' ? ['code', 'name'] : ['name']
      const missing = requiredFields.find((field) => !values[field])
      if (missing) {
        counts.invalid += 1
        errors.push({ file: importFileName, sheet: 'Hoja 1', row: index + 2, field: missing, issue: 'Campo obligatorio vacío', correction: `Completa ${missing} y vuelve a validar.` })
        prepared.push({ rowNumber: index + 2, values, classification: 'invalid' })
        return
      }
      const key = values.id || values.code || normalizeText(values.name)
      const existing = existingRecords.find((record) => record.id === values.id || ('code' in record && record.code === values.code) || (!('code' in record) && normalizeText(record.name) === normalizeText(values.name)))
      if (!existing) {
        counts.added += 1
        prepared.push({ rowNumber: index + 2, values, classification: 'added' })
        return
      }
      const localName = 'code' in existing ? `${existing.code} · ${existing.name}` : existing.name
      const fileName = values.code ? `${values.code} · ${values.name}` : values.name
      const changed = values.name !== existing.name || ('code' in existing && values.code && values.code !== existing.code) || (values.phone && 'phone' in existing && values.phone !== existing.phone) || (values.email && 'email' in existing && values.email !== existing.email)
      if (!changed) {
        counts.unchanged += 1
        counts.duplicated += 1
        prepared.push({ rowNumber: index + 2, values, existingId: existing.id, classification: 'unchanged' })
      } else if (!existing.isSample) {
        counts.conflicts += 1
        conflicts.push({ key, name: values.name, localValue: localName, fileValue: fileName, choice: 'file' })
        prepared.push({ rowNumber: index + 2, values, existingId: existing.id, classification: 'conflict' })
      } else {
        counts.updated += 1
        prepared.push({ rowNumber: index + 2, values, existingId: existing.id, classification: 'updated' })
      }
    })
    setImportValidation(counts)
    setImportPrepared(prepared)
    setImportErrors(errors)
    setImportConflicts(conflicts)
    setImportStep(3)
  }

  const updateConflictChoice = (index: number, choice: ImportConflict['choice']) => setImportConflicts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, choice } : item))

  const applyImport = () => {
    if (!requirePermission('imports', 'aplicar importaciones')) return
    if (!importValidation) return
    const backup: BackupRecord = { id: makeId('backup'), date: nowIso(), source: `Antes de importar ${importFileName}`, snapshot: cloneState(state) }
    const date = nowIso()
    const conflictRowIndex = new Map(importPrepared.filter((item) => item.classification === 'conflict').map((item, index) => [item.rowNumber, index]))
    const conflictChoiceFor = (row: ImportPreparedRow) => row.classification === 'conflict' ? importConflicts[conflictRowIndex.get(row.rowNumber) ?? -1]?.choice : undefined
    const shouldApply = (row: ImportPreparedRow) => {
      if (row.classification === 'invalid' || row.classification === 'unchanged') return false
      if (row.classification !== 'conflict') return true
      const choice = conflictChoiceFor(row)
      return choice === 'file' || choice === 'duplicate'
    }
    const applicable = importPrepared.filter(shouldApply)
    const newState = cloneState(state)
    if (importModule === 'products') {
      applicable.forEach((prepared) => {
        const values = prepared.values
        const duplicateChoice = conflictChoiceFor(prepared) === 'duplicate'
        const existingIndex = duplicateChoice ? -1 : newState.products.findIndex((item) => item.id === prepared.existingId || item.code === values.code)
        const previous = existingIndex >= 0 ? newState.products[existingIndex] : null
        const record: Product = { ...(previous ?? makeSeedMeta(makeId('product'), false)), createdAt: previous?.createdAt ?? date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', isSample: false, code: duplicateChoice ? `${values.code || 'IMPORT'}-COPIA-${prepared.rowNumber}` : values.code, name: duplicateChoice ? `${values.name} (copia)` : values.name, category: values.category || previous?.category || 'General', unit: values.unit || previous?.unit || 'pieza', priceCents: values.price ? parseMoneyInput(values.price) : previous?.priceCents ?? 0, costCents: values.cost ? parseMoneyInput(values.cost) : previous?.costCents ?? 0, stock: values.stock ? Number(values.stock) : previous?.stock ?? 0, minStock: values.minStock ? Number(values.minStock) : previous?.minStock ?? 0, active: parseBoolean(values.active, previous?.active ?? true), version: (previous?.version ?? 0) + 1 }
        if (existingIndex >= 0) newState.products[existingIndex] = record
        else newState.products.unshift(record)
      })
    } else if (importModule === 'ingredients') {
      applicable.forEach((prepared) => {
        const values = prepared.values
        const duplicateChoice = conflictChoiceFor(prepared) === 'duplicate'
        const existingIndex = duplicateChoice ? -1 : newState.ingredients.findIndex((item) => item.id === prepared.existingId || item.code === values.code)
        const previous = existingIndex >= 0 ? newState.ingredients[existingIndex] : null
        const record: Ingredient = { ...(previous ?? makeSeedMeta(makeId('ingredient'), false)), createdAt: previous?.createdAt ?? date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending', isSample: false, code: duplicateChoice ? `${values.code || 'IMPORT'}-COPIA-${prepared.rowNumber}` : values.code, name: duplicateChoice ? `${values.name} (copia)` : values.name, unit: values.unit || previous?.unit || 'kg', costCents: values.cost ? parseMoneyInput(values.cost) : previous?.costCents ?? 0, stock: values.stock ? Number(values.stock) : previous?.stock ?? 0, minStock: values.minStock ? Number(values.minStock) : previous?.minStock ?? 0, active: parseBoolean(values.active, previous?.active ?? true), version: (previous?.version ?? 0) + 1 }
        if (existingIndex >= 0) newState.ingredients[existingIndex] = record
        else newState.ingredients.unshift(record)
      })
    } else {
      const collection = importModule === 'customers' ? newState.customers : newState.suppliers
      applicable.forEach((prepared) => {
        const values = prepared.values
        const duplicateChoice = conflictChoiceFor(prepared) === 'duplicate'
        const existingIndex = duplicateChoice ? -1 : collection.findIndex((item) => item.id === prepared.existingId || normalizeText(item.name) === normalizeText(values.name))
        const previous = existingIndex >= 0 ? collection[existingIndex] : null
        const base = { ...(previous ?? makeSeedMeta(makeId(importModule === 'customers' ? 'customer' : 'supplier'), false)), createdAt: previous?.createdAt ?? date, updatedAt: date, deviceId: state.deviceId, syncStatus: 'pending' as const, isSample: false, name: duplicateChoice ? `${values.name} (copia)` : values.name, phone: values.phone || previous?.phone || '', email: values.email || previous?.email || '', notes: values.notes || previous?.notes || '', active: parseBoolean(values.active, previous?.active ?? true), version: (previous?.version ?? 0) + 1 }
        if (importModule === 'customers') { if (existingIndex >= 0) newState.customers[existingIndex] = base as Customer; else newState.customers.unshift(base as Customer) }
        else { if (existingIndex >= 0) newState.suppliers[existingIndex] = base as Supplier; else newState.suppliers.unshift(base as Supplier) }
      })
    }
    const run: SyncRun = { id: makeId('sync'), date, fileName: importFileName, direction: 'import', scope: activeAdminModule.label, status: importValidation.invalid || importValidation.conflicts ? 'needs_review' : 'completed', added: importValidation.added, updated: importValidation.updated, duplicated: importValidation.duplicated, invalid: importValidation.invalid, conflicts: importValidation.conflicts }
    newState.backups = [backup, ...newState.backups].slice(0, 12)
    newState.syncRuns = [run, ...newState.syncRuns]
    newState.sampleData = false
    newState.lastSavedAt = date
    setState(newState)
    setImportStep(4)
    setImportResultMessage(`${applicable.length} filas aplicadas. Se creó un respaldo automático antes de importar.`)
    showNotice({ tone: 'success', title: 'Importación aplicada', message: 'Los datos aprobados ya forman parte del estado local.' })
  }

  const rowsForModule = (module: ImportModule): Record<string, unknown>[] => {
    if (module === 'products') return state.products.map((item) => ({ id: item.id, code: item.code, name: item.name, category: item.category, unit: item.unit, price: item.priceCents / 100, cost: item.costCents / 100, stock: item.stock, minStock: item.minStock, active: item.active }))
    if (module === 'ingredients') return state.ingredients.map((item) => ({ id: item.id, code: item.code, name: item.name, unit: item.unit, cost: item.costCents / 100, stock: item.stock, minStock: item.minStock, active: item.active }))
    if (module === 'customers') return state.customers.map((item) => ({ id: item.id, name: item.name, phone: item.phone, email: item.email, notes: item.notes, active: item.active }))
    if (module === 'suppliers') return state.suppliers.map((item) => ({ id: item.id, name: item.name, phone: item.phone, email: item.email, notes: item.notes, active: item.active }))
    return []
  }

  const exportCsvModule = (module: ImportModule) => {
    const rows = rowsForModule(module)
    downloadBlob(encodeCsv(rows), `clarasoft-${module}.csv`, 'text/csv;charset=utf-8')
    commit((previous) => ({ ...previous, syncRuns: [{ id: makeId('sync'), date: nowIso(), fileName: `clarasoft-${module}.csv`, direction: 'export', scope: activeAdminModule.label, status: 'completed', added: 0, updated: 0, duplicated: rows.length, invalid: 0, conflicts: 0 }, ...previous.syncRuns] }))
    showNotice({ tone: 'success', title: 'CSV listo', message: 'El archivo se descargó para cargarlo manualmente en Google Sheets.' })
  }

  const exportXlsx = async () => {
    try {
      const xlsx = await import('xlsx')
      const workbook = xlsx.utils.book_new()
      const sheets: { name: string; rows: Record<string, unknown>[] }[] = [
        { name: 'Productos', rows: rowsForModule('products') },
        { name: 'Insumos', rows: rowsForModule('ingredients') },
        { name: 'Clientes', rows: rowsForModule('customers') },
        { name: 'Proveedores', rows: rowsForModule('suppliers') },
        { name: 'Ventas', rows: state.sales.map((sale) => ({ id: sale.id, folio: sale.folio, date: sale.date, customerId: sale.customerId, total: sale.totalCents / 100, paymentMethod: sale.paymentMethod, status: sale.status, lines: JSON.stringify(sale.lines) })) },
        { name: 'Compras', rows: state.purchases.map((purchase) => ({ id: purchase.id, folio: purchase.folio, date: purchase.date, supplierId: purchase.supplierId, total: purchase.totalCents / 100, reference: purchase.reference, status: purchase.status, lines: JSON.stringify(purchase.lines) })) },
        { name: 'Produccion', rows: state.productionOrders.map((order) => ({ id: order.id, folio: order.folio, productId: order.productId, productName: order.productName, plannedOutput: order.plannedOutput, actualOutput: order.actualOutput, status: order.status, requirements: JSON.stringify(order.requirements) })) },
        { name: 'Movimientos', rows: state.inventoryMovements.map((movement) => ({ id: movement.id, date: movement.date, entityType: movement.entityType, itemId: movement.itemId, itemName: movement.itemName, quantity: movement.quantity, beforeStock: movement.beforeStock, afterStock: movement.afterStock, sourceType: movement.sourceType, sourceId: movement.sourceId, note: movement.note })) },
        { name: 'Configuracion', rows: [{ ...state.settings }] },
      ]
      sheets.forEach((sheet) => xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(sheet.rows), sheet.name))
      const output = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' })
      downloadBlob(output, 'clarasoft-respaldo.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      commit((previous) => ({ ...previous, syncRuns: [{ id: makeId('sync'), date: nowIso(), fileName: 'clarasoft-respaldo.xlsx', direction: 'export', scope: 'Todos los módulos', status: 'completed', added: 0, updated: 0, duplicated: 0, invalid: 0, conflicts: 0 }, ...previous.syncRuns] }))
      showNotice({ tone: 'success', title: 'Libro XLSX listo', message: 'Incluye las hojas operativas y puede importarse manualmente en Google Sheets.' })
    } catch (error) {
      showNotice({ tone: 'error', title: 'No se pudo exportar XLSX', message: error instanceof Error ? error.message : 'El navegador no pudo generar el libro.' })
    }
  }

  const downloadJsonBackup = () => {
    const snapshot = cloneState(state)
    downloadBlob(JSON.stringify(snapshot, null, 2), `clarasoft-respaldo-${state.lastSavedAt.slice(0, 10)}.json`, 'application/json;charset=utf-8')
    commit((previous) => ({ ...previous, syncRuns: [{ id: makeId('sync'), date: nowIso(), fileName: 'respaldo.json', direction: 'backup', scope: 'Todos los módulos', status: 'completed', added: 0, updated: 0, duplicated: 0, invalid: 0, conflicts: 0 }, ...previous.syncRuns] }))
    showNotice({ tone: 'success', title: 'Respaldo JSON descargado', message: 'Guárdalo fuera del dispositivo para recuperación manual.' })
  }

  const handleRestoreFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<AppState>
      const valid = (parsed?.schemaVersion === 1 || parsed?.schemaVersion === 2) && Array.isArray(parsed.products) && Array.isArray(parsed.sales) && parsed.settings && typeof parsed.settings === 'object'
      if (!valid) throw new Error('El respaldo no coincide con la estructura ClaraSoft v1 o v2.')
      setRestorePreview({ fileName: file.name, snapshot: migrateAppState(parsed) })
      setRestoreDialogOpen(true)
    } catch (error) {
      showNotice({ tone: 'error', title: 'Respaldo inválido', message: error instanceof Error ? error.message : 'No se pudo validar el JSON.' })
    }
  }

  const confirmRestore = () => {
    if (!restorePreview) return
    const backup: BackupRecord = { id: makeId('backup'), date: nowIso(), source: `Antes de restaurar ${restorePreview.fileName}`, snapshot: cloneState(state) }
    const restored = cloneState(restorePreview.snapshot)
    restored.backups = [backup, ...(restored.backups ?? [])].slice(0, 12)
    restored.lastSavedAt = nowIso()
    setState(restored)
    setCartLines(restored.activeCart?.lines ?? [])
    setCartCustomerId(restored.activeCart?.customerId ?? '')
    setCartDiscountInput(String((restored.activeCart?.discountCents ?? 0) / 100))
    setRestoreDialogOpen(false)
    setRestorePreview(null)
    showNotice({ tone: 'success', title: 'Respaldo restaurado', message: 'La restauración reemplazó el estado local después de crear una copia de seguridad.' })
  }

  const downloadImportErrors = () => {
    downloadBlob(encodeCsv(importErrors), `errores-${importFileName || 'importacion'}.csv`, 'text/csv;charset=utf-8')
    showNotice({ tone: 'success', title: 'Informe descargado', message: 'El CSV incluye archivo, hoja, fila, campo y corrección sugerida.' })
  }

  const turnSampleData = (checked: boolean) => {
    if (checked) {
      const sample = createSeedState()
      const merge = <T extends { id: string }>(current: T[], examples: T[]) => [...current, ...examples.filter((example) => !current.some((item) => item.id === example.id))]
      commit((previous) => ({ ...previous, sampleData: true, products: merge(previous.products, sample.products), ingredients: merge(previous.ingredients, sample.ingredients), recipes: merge(previous.recipes, sample.recipes), customers: merge(previous.customers, sample.customers), suppliers: merge(previous.suppliers, sample.suppliers), sales: merge(previous.sales, sample.sales), purchases: merge(previous.purchases, sample.purchases), productionOrders: merge(previous.productionOrders, sample.productionOrders), inventoryMovements: merge(previous.inventoryMovements, sample.inventoryMovements) }))
      showNotice({ tone: 'info', title: 'Datos de ejemplo activados', message: 'Se agregaron ejemplos sin borrar los registros reales de este dispositivo.' })
      return
    }
    commit((previous) => ({ ...previous, sampleData: false, products: previous.products.filter((item) => !item.isSample), ingredients: previous.ingredients.filter((item) => !item.isSample), recipes: previous.recipes.filter((item) => !item.isSample), customers: previous.customers.filter((item) => !item.isSample), suppliers: previous.suppliers.filter((item) => !item.isSample), sales: previous.sales.filter((item) => !item.isSample), purchases: previous.purchases.filter((item) => !item.isSample), productionOrders: previous.productionOrders.filter((item) => !item.isSample), inventoryMovements: previous.inventoryMovements.filter((item) => !item.isSample), heldCarts: [], activeCart: { lines: [], customerId: '', discountCents: 0 } }))
    setCartLines([])
    setCartCustomerId('')
    setCartDiscountInput('0')
    showNotice({ tone: 'info', title: 'Datos de ejemplo desactivados', message: 'Solo se retiraron los registros de ejemplo. Importa un respaldo o crea tu primer producto para comenzar.' })
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => commit((previous) => ({ ...previous, settings: { ...previous.settings, [key]: value } }))

  const activeProfile = state.profiles.find((profile) => profile.id === state.activeProfileId) ?? state.profiles.find((profile) => profile.active) ?? state.profiles[0]
  const can = (permission: PermissionKey) => Boolean(activeProfile?.permissions?.[permission])
  const requirePermission = (permission: PermissionKey, action: string) => {
    if (can(permission)) return true
    showNotice({ tone: 'warning', title: 'Permiso requerido', message: `${activeProfile?.name ?? 'Este perfil'} no puede ${action}. Cambia a un perfil autorizado.` })
    return false
  }

  const updateSettingsSection = <K extends keyof Settings>(key: K, patch: Partial<Settings[K]>) => commit((previous) => ({ ...previous, settings: { ...previous.settings, [key]: { ...(previous.settings[key] as object), ...patch } as Settings[K] } }))

  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { showNotice({ tone: 'error', title: 'Formato no compatible', message: 'El logo debe ser una imagen PNG, JPEG, WebP o GIF.' }); return }
    if (file.size > 1024 * 1024) { showNotice({ tone: 'error', title: 'Imagen demasiado grande', message: 'Usa una imagen de máximo 1 MB para mantener el almacenamiento local estable.' }); return }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '')
      if (!dataUrl.startsWith('data:image/')) { showNotice({ tone: 'error', title: 'No se pudo leer el logo', message: 'Selecciona otra imagen.' }); return }
      updateSetting('logoDataUrl', dataUrl)
      showNotice({ tone: 'success', title: 'Logo guardado', message: 'Se almacenó como dato local en este dispositivo.' })
    }
    reader.onerror = () => showNotice({ tone: 'error', title: 'No se pudo leer el logo', message: 'Selecciona otra imagen.' })
    reader.readAsDataURL(file)
  }

  const updateNavigation = (id: View, patch: Partial<ModuleConfig>) => commit((previous) => {
    const next = previous.settings.navigation.map((item) => item.id === id ? { ...item, ...patch } : item)
    const visibleCount = next.filter((item) => item.visible).length
    if (visibleCount === 0) return previous
    return { ...previous, settings: { ...previous.settings, navigation: next } }
  })

  const moveNavigation = (id: View, direction: -1 | 1) => commit((previous) => {
    const current = [...previous.settings.navigation].sort((a, b) => a.order - b.order)
    const index = current.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= current.length) return previous
    const [moved] = current.splice(index, 1)
    current.splice(target, 0, moved)
    return { ...previous, settings: { ...previous.settings, navigation: current.map((item, order) => ({ ...item, order })) } }
  })

  const addCustomField = () => {
    if (!customFieldForm.label.trim()) { showNotice({ tone: 'warning', title: 'Etiqueta requerida', message: 'Escribe un nombre para el campo personalizado.' }); return }
    const definition: CustomFieldDefinition = { id: customFieldEditingId || makeId('field'), label: customFieldForm.label.trim(), type: customFieldForm.type, options: customFieldForm.options.split(',').map((item) => item.trim()).filter(Boolean), active: customFieldForm.active }
    commit((previous) => ({ ...previous, settings: { ...previous.settings, customFields: { ...previous.settings.customFields, [customFieldEntity]: customFieldEditingId ? previous.settings.customFields[customFieldEntity].map((field) => field.id === customFieldEditingId ? definition : field) : [...previous.settings.customFields[customFieldEntity], definition] } } }))
    setCustomFieldEditingId('')
    setCustomFieldForm({ label: '', type: 'text', options: '', active: true })
    showNotice({ tone: 'success', title: customFieldEditingId ? 'Campo actualizado' : 'Campo creado', message: 'Se mostrará en los formularios y detalles asociados.' })
  }

  const editCustomField = (field: CustomFieldDefinition) => {
    setCustomFieldEditingId(field.id)
    setCustomFieldForm({ label: field.label, type: field.type, options: field.options.join(', '), active: field.active })
  }

  const removeCustomField = (fieldId: string) => commit((previous) => ({ ...previous, settings: { ...previous.settings, customFields: { ...previous.settings.customFields, [customFieldEntity]: previous.settings.customFields[customFieldEntity].filter((field) => field.id !== fieldId) } } }))

  const fieldDefinitions = (entity: CustomFieldEntity) => state.settings.customFields[entity].filter((field) => field.active)
  const renderCustomFieldEditor = (entity: CustomFieldEntity, values: CustomFieldValues, onChange: (values: CustomFieldValues) => void) => {
    const fields = fieldDefinitions(entity)
    if (fields.length === 0) return null
    return <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3"><div><p className="text-sm font-semibold">Información adicional</p><p className="text-xs text-muted-foreground">Campos configurados desde Administración.</p></div>{fields.map((field) => {
      const value = values[field.id]
      const update = (next: CustomFieldValue | null) => onChange({ ...values, [field.id]: next })
      return <div key={field.id}>{field.type === 'boolean' ? <div className="flex min-h-11 items-center justify-between gap-3"><Label htmlFor={`custom-${entity}-${field.id}`}>{field.label}</Label><Switch id={`custom-${entity}-${field.id}`} checked={value === true} onCheckedChange={(checked) => update(checked)} /></div> : <><Label htmlFor={`custom-${entity}-${field.id}`}>{field.label}</Label>{field.type === 'select' ? <select id={`custom-${entity}-${field.id}`} value={typeof value === 'string' ? value : ''} onChange={(event) => update(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">Seleccionar</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <Input id={`custom-${entity}-${field.id}`} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={value == null ? '' : String(value)} onChange={(event) => update(field.type === 'number' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value)} className="mt-1 h-11" />}</>}</div>
    })}</div>
  }
  const renderCustomFieldSummary = (entity: CustomFieldEntity, values?: CustomFieldValues) => {
    const fields = fieldDefinitions(entity)
    const entries = fields.map((field) => ({ field, value: values?.[field.id] })).filter((entry) => entry.value !== undefined && entry.value !== null && entry.value !== '')
    if (entries.length === 0) return null
    return <div className="flex flex-wrap gap-2">{entries.map(({ field, value }) => <span key={field.id} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">{field.label}: {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}</span>)}</div>
  }

  const updateCustomValues = (entity: CustomFieldEntity, values: CustomFieldValues, recordId: string) => {
    const date = nowIso()
    commit((previous) => {
      if (entity === 'products') return { ...previous, products: previous.products.map((item) => item.id === recordId ? { ...item, customFields: values, updatedAt: date } : item) }
      if (entity === 'customers') return { ...previous, customers: previous.customers.map((item) => item.id === recordId ? { ...item, customFields: values, updatedAt: date } : item) }
      if (entity === 'purchases') return { ...previous, purchases: previous.purchases.map((item) => item.id === recordId ? { ...item, customFields: values, updatedAt: date } : item) }
      return { ...previous, productionOrders: previous.productionOrders.map((item) => item.id === recordId ? { ...item, customFields: values, updatedAt: date } : item) }
    })
  }

  const createConfigurationTemplate = (): ConfigurationTemplate => ({ kind: 'clarasoft-configuration', version: 1, settings: cloneState(state).settings, profiles: cloneState(state).profiles, activeProfileId: state.activeProfileId })
  const downloadConfigurationTemplate = () => downloadBlob(JSON.stringify(createConfigurationTemplate(), null, 2), 'clarasoft-configuracion.json', 'application/json;charset=utf-8')
  const handleConfigurationFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<ConfigurationTemplate>
      const valid = parsed?.kind === 'clarasoft-configuration' && parsed?.version === 1 && parsed.settings && typeof parsed.settings === 'object' && Array.isArray(parsed.profiles)
      if (!valid) throw new Error('El archivo no coincide con una plantilla de configuración ClaraSoft.')
      const templateProfiles = Array.isArray(parsed.profiles) ? parsed.profiles as LocalProfile[] : []
      const template = { kind: 'clarasoft-configuration', version: 1, settings: mergeSettings(parsed.settings), profiles: templateProfiles, activeProfileId: parsed.activeProfileId ?? templateProfiles[0]?.id } as ConfigurationTemplate
      setTemplatePreview({ fileName: file.name, template })
    } catch (error) { showNotice({ tone: 'error', title: 'Plantilla inválida', message: error instanceof Error ? error.message : 'No se pudo validar el JSON.' }) }
  }
  const applyConfigurationTemplate = () => {
    if (!templatePreview) return
    const profiles = templatePreview.template.profiles.filter((profile) => profile && profile.id && profile.name && profile.pinDigest)
    const activeProfileId = profiles.some((profile) => profile.id === templatePreview.template.activeProfileId && profile.active) ? templatePreview.template.activeProfileId : profiles.find((profile) => profile.active)?.id ?? state.activeProfileId
    commit((previous) => ({ ...previous, settings: mergeSettings(templatePreview.template.settings, previous.products.map((product) => product.id)), profiles: profiles.length ? profiles : previous.profiles, activeProfileId }))
    setTemplatePreview(null)
    showNotice({ tone: 'success', title: 'Configuración aplicada', message: 'La plantilla se integró y el resto de registros operativos se conservó.' })
  }

  const prepareDefaultRestore = () => setDefaultsPreviewOpen(true)
  const applyDefaultRestore = () => {
    const nextSettings = createDefaultSettings(state.products.map((product) => product.id))
    const profiles = createDefaultProfiles()
    commit((previous) => ({ ...previous, settings: nextSettings, profiles, activeProfileId: profiles[0].id }))
    setDefaultsPreviewOpen(false)
    showNotice({ tone: 'success', title: 'Configuración restablecida', message: 'Solo se restablecieron preferencias, módulos, formatos y perfiles; los registros operativos siguen intactos.' })
  }

  const openProfileEditor = (profile?: LocalProfile) => {
    setProfileEditingId(profile?.id ?? '')
    setProfileForm(profile ? { name: profile.name, pin: '', active: profile.active, permissions: { ...profile.permissions } } : { name: '', pin: '', active: true, permissions: { admin: false, reversals: false, imports: false, inventory: false, production: false } })
    setProfileDialogOpen(true)
  }

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { showNotice({ tone: 'warning', title: 'Nombre requerido', message: 'Escribe un nombre para el perfil.' }); return }
    if (!profileEditingId && !/^\d{4,8}$/.test(profileForm.pin)) { showNotice({ tone: 'warning', title: 'PIN inválido', message: 'Usa un PIN de 4 a 8 dígitos.' }); return }
    if (profileForm.pin && !/^\d{4,8}$/.test(profileForm.pin)) { showNotice({ tone: 'warning', title: 'PIN inválido', message: 'Usa un PIN de 4 a 8 dígitos.' }); return }
    const date = nowIso()
    const digest = profileForm.pin ? await digestPin(profileForm.pin) : undefined
    commit((previous) => {
      if (profileEditingId) return { ...previous, profiles: previous.profiles.map((profile) => profile.id === profileEditingId ? { ...profile, name: profileForm.name.trim(), active: profileForm.active, permissions: profileForm.permissions, pinDigest: digest ?? profile.pinDigest, updatedAt: date } : profile) }
      const profile: LocalProfile = { id: makeId('profile'), name: profileForm.name.trim(), pinDigest: digest ?? DEFAULT_ADMIN_PIN_DIGEST, active: profileForm.active, permissions: profileForm.permissions, createdAt: date, updatedAt: date }
      return { ...previous, profiles: [...previous.profiles, profile] }
    })
    setProfileDialogOpen(false)
    showNotice({ tone: 'success', title: profileEditingId ? 'Perfil actualizado' : 'Perfil creado', message: 'El PIN se guardó como digest y no vuelve a mostrarse.' })
  }

  const verifyProfileSwitch = async () => {
    const profile = state.profiles.find((item) => item.id === switchProfileId && item.active)
    if (!profile) { showNotice({ tone: 'warning', title: 'Perfil no disponible', message: 'Elige un perfil activo.' }); return }
    const digest = await digestPin(switchPin)
    if (digest !== profile.pinDigest) { showNotice({ tone: 'error', title: 'PIN incorrecto', message: 'No se cambió el perfil activo.' }); return }
    commit((previous) => ({ ...previous, activeProfileId: profile.id }))
    setSwitchProfileOpen(false)
    setSwitchPin('')
    showNotice({ tone: 'success', title: `Perfil ${profile.name} activo`, message: 'Los permisos disponibles se actualizaron inmediatamente.' })
  }

  const updateProfileStatus = (profileId: string, active: boolean) => {
    if (!active && state.profiles.filter((profile) => profile.active).length <= 1) { showNotice({ tone: 'warning', title: 'Se requiere un perfil activo', message: 'Activa otro perfil antes de desactivar este.' }); return }
    commit((previous) => ({ ...previous, profiles: previous.profiles.map((profile) => profile.id === profileId ? { ...profile, active, updatedAt: nowIso() } : profile), activeProfileId: previous.activeProfileId === profileId && !active ? previous.profiles.find((profile) => profile.id !== profileId && profile.active)?.id ?? previous.activeProfileId : previous.activeProfileId }))
  }

  const navigate = (view: View) => {
    if (!state.settings.navigation.some((item) => item.id === view && item.visible)) return
    if (view === 'admin' && !can('admin') && !can('imports') && !can('inventory')) {
      showNotice({ tone: 'warning', title: 'Administración restringida', message: 'Tu perfil no tiene permisos para abrir este módulo.' })
      return
    }
    setActiveView(view)
    setSidebarOpen(false)
    setCartOpen(false)
  }

  const runQuickAction = (action: QuickActionId) => {
    if (action === 'newSale') { navigate('pos'); clearCart(); return }
    if (action === 'newPurchase') { navigate('movements'); openNewPurchase(); return }
    if (action === 'newCustomer') { navigate('customers'); openCustomerEditor(); return }
    if (action === 'newProduction') { navigate('production'); setProductionDialogOpen(true); return }
    if (action === 'inventory') { navigate('admin'); setAdminTab('inventory') }
  }

  const navigationItems = [...state.settings.navigation].sort((a, b) => a.order - b.order).filter((item) => item.visible)
  const labelForView = (view: View) => state.settings.navigation.find((item) => item.id === view)?.label ?? (view === 'pos' ? 'Punto de venta' : view === 'movements' ? 'Movimientos' : view === 'production' ? 'Producción' : view === 'customers' ? 'Clientes' : 'Administración')
  useEffect(() => {
    if (navigationItems.length > 0 && !navigationItems.some((item) => item.id === activeView)) setActiveView(navigationItems[0].id)
  }, [state.settings.navigation, activeView])
  useEffect(() => {
    const visibleCategories = state.settings.pos.categories.filter((category) => category.visible).map((category) => category.name)
    if (visibleCategories.length > 0 && !visibleCategories.includes(posCategory)) setPosCategory(visibleCategories[0])
  }, [state.settings.pos.categories, posCategory])
  const pageTitle = labelForView(activeView)
  const pageSubtitle = activeView === 'pos' ? `Folio ${state.settings.folioPrefixes.sale}${state.settings.nextSaleNumber}` : activeView === 'movements' ? 'Ventas y compras' : activeView === 'production' ? `${state.productionOrders.filter((order) => order.status === 'in_progress').length} activas` : activeView === 'customers' ? `${state.customers.length} perfiles` : 'Catálogo y control local'
  const confirmedSalesToday = state.sales.filter((sale) => sale.status === 'confirmed').reduce((sum, sale) => sum + sale.totalCents, 0)
  const lowStockCount = state.products.filter((product) => product.stock <= product.minStock).length + state.ingredients.filter((ingredient) => ingredient.stock <= ingredient.minStock).length
  const pendingSyncCount = [...state.products, ...state.ingredients, ...state.sales, ...state.purchases, ...state.productionOrders].filter((item) => item.syncStatus === 'pending').length

  const renderPosView = () => {
    const cartItemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0)
    const renderCartPanel = () => (
      <Card className="flex min-h-0 flex-col border-primary/20 bg-card shadow-lg">
        <CardHeader className="border-b border-border/70 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0"><CardTitle className="text-base">Venta actual</CardTitle><CardDescription>{cartItemCount} artículos</CardDescription></div>
            <div className="rounded-xl bg-primary/10 p-2 text-primary"><ShoppingCart className="h-5 w-5" /></div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {cartLines.length === 0 ? <EmptyState icon={<ShoppingCart className="h-5 w-5" />} title="Carrito vacío" message="Agrega un producto para comenzar." /> : <div className="space-y-2">{cartLines.map((line) => {
            const product = state.products.find((item) => item.id === line.productId)
            if (!product) return null
            return <div key={line.productId} className="rounded-xl border border-border/70 bg-background/60 p-3">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatMoney(product.priceCents, currency)} · {product.unit}</p></div><span className="font-mono text-sm font-semibold tabular-nums">{formatMoney(product.priceCents * line.quantity, currency)}</span></div>
              <div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1"><Button variant="ghost" size="icon" onClick={() => adjustCartQuantity(product.id, -1)} className="h-11 w-11" aria-label={`Reducir ${product.name}`}><Minus className="h-4 w-4" /></Button><span className="w-8 text-center font-mono text-xs tabular-nums">{line.quantity}</span><Button variant="ghost" size="icon" onClick={() => adjustCartQuantity(product.id, 1)} className="h-11 w-11" aria-label={`Aumentar ${product.name}`}><Plus className="h-4 w-4" /></Button></div><Button variant="ghost" size="sm" onClick={() => updateActiveCart(cartLines.filter((item) => item.productId !== product.id))} className="min-h-9 px-2 text-muted-foreground hover:text-destructive"><Trash2 className="mr-1.5 h-3.5 w-3.5" />Quitar</Button></div>
            </div>
          })}</div>}
          <div className="space-y-3 border-t border-border/70 pt-4">
            <div><Label htmlFor="cart-customer" className="text-xs">Cliente</Label><select id="cart-customer" value={cartCustomerId} onChange={(event) => updateCartCustomer(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">Público general</option>{state.customers.filter((customer) => customer.active).map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></div>
            <div><Label htmlFor="cart-discount" className="text-xs">Descuento</Label><div className="relative mt-1"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span><Input id="cart-discount" inputMode="decimal" value={cartDiscountInput} onChange={(event) => updateCartDiscount(event.target.value)} className="h-11 pl-7" /></div></div>
            <div><Label className="text-xs">Pago</Label><div className="mt-1 grid grid-cols-2 gap-2">{state.settings.pos.enabledPaymentMethods.map((method) => <Button key={method} variant={paymentMethod === method ? 'default' : 'outline'} size="sm" onClick={() => setPaymentMethod(method)} className="min-h-11 justify-start px-3"><span className="mr-2">{method === 'Efectivo' ? <Banknote className="h-4 w-4" /> : method === 'Tarjeta' ? <CreditCard className="h-4 w-4" /> : method === 'Transferencia' ? <Landmark className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}</span>{method}</Button>)}</div></div>
            {paymentMethod === 'Efectivo' ? <div><Label htmlFor="received" className="text-xs">Recibido</Label><Input id="received" inputMode="decimal" value={receivedInput} onChange={(event) => setReceivedInput(event.target.value)} className="mt-1 h-11" /></div> : null}
          </div>
        </CardContent>
        <CardFooter className="block space-y-3 border-t border-border/70 px-4 py-4 sm:px-5">
          <div className="space-y-1.5 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-mono tabular-nums">{formatMoney(cartSubtotal, currency)}</span></div><div className="flex justify-between text-muted-foreground"><span>Descuento</span><span className="font-mono tabular-nums">−{formatMoney(cartDiscountCents, currency)}</span></div>{state.settings.taxRate > 0 ? <div className="flex justify-between text-muted-foreground"><span>Impuesto ({state.settings.taxRate}%)</span><span className="font-mono tabular-nums">{formatMoney(cartTaxCents, currency)}</span></div> : null}<div className="flex items-end justify-between border-t border-border/70 pt-3"><span className="font-semibold">Total</span><span className="font-serif text-3xl tabular-nums">{formatMoney(cartTotal, currency)}</span></div>{paymentMethod === 'Efectivo' && cartLines.length > 0 ? <div className={`flex justify-between text-xs ${paymentComplete ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}><span>{paymentComplete ? 'Cambio' : 'Faltan'}</span><span className="font-mono font-semibold tabular-nums">{formatMoney(paymentComplete ? changeCents : Math.max(0, cartTotal - receivedCents), currency)}</span></div> : null}</div>
          <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={clearCart} className="min-h-11" disabled={cartLines.length === 0}><Trash2 className="mr-2 h-4 w-4" />Cancelar</Button><Button onClick={() => { confirmSale(); setCartOpen(false) }} className="min-h-11" disabled={cartLines.length === 0 || !paymentComplete}><Receipt className="mr-2 h-4 w-4" />Cobrar</Button></div>
        </CardFooter>
      </Card>
    )
    return <div className="space-y-4 pb-24 lg:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Caja · {state.settings.folioPrefixes.sale}{state.settings.nextSaleNumber}</p><p className="text-xs text-muted-foreground">{state.settings.businessName}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setResumeDialogOpen(true)} className="min-h-11 px-3"><Archive className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Retomadas</span>{state.heldCarts.length ? ` · ${state.heldCarts.length}` : ''}</Button><Button variant="outline" onClick={suspendCart} className="min-h-11 px-3"><Clock className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Suspender</span></Button></div></div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">{state.settings.dashboard.kpis.map((kpi) => { const metric = kpi === 'salesToday' ? { label: 'Ventas confirmadas', value: formatMoney(confirmedSalesToday, currency) } : kpi === 'operations' ? { label: 'Operaciones', value: String(state.sales.length + state.purchases.length) } : kpi === 'purchases' ? { label: 'Compras confirmadas', value: formatMoney(state.purchases.filter((purchase) => purchase.status === 'confirmed').reduce((sum, purchase) => sum + purchase.totalCents, 0), currency) } : kpi === 'drafts' ? { label: 'Borradores', value: String(state.sales.filter((sale) => sale.status === 'draft').length + state.purchases.filter((purchase) => purchase.status === 'draft').length) } : kpi === 'lowStock' ? { label: 'Alertas de inventario', value: String(lowStockCount) } : { label: 'Clientes activos', value: String(state.customers.filter((customer) => customer.active).length) }; return <div key={kpi} className="bg-card p-3"><p className="text-[10px] text-muted-foreground">{dashboardKpiOptions.find((option) => option.id === kpi)?.label ?? metric.label}</p><p className="mt-1 truncate font-serif text-xl tabular-nums" style={{ color: accentHexByPalette[state.settings.accentPalette] }}>{metric.value}</p></div> })}</div>
      <div className="flex flex-wrap gap-2">{state.settings.dashboard.quickActions.includes('newCustomer') ? <Button variant="outline" onClick={() => openCustomerEditor()} className="min-h-10"><UserRoundPlus className="mr-2 h-4 w-4" />Cliente</Button> : null}{state.settings.dashboard.quickActions.includes('newPurchase') ? <Button variant="outline" onClick={openNewPurchase} className="min-h-10"><Boxes className="mr-2 h-4 w-4" />Compra</Button> : null}{state.settings.dashboard.quickActions.includes('newProduction') ? <Button variant="outline" onClick={() => setProductionDialogOpen(true)} className="min-h-10"><Factory className="mr-2 h-4 w-4" />Producción</Button> : null}{state.settings.dashboard.quickActions.includes('inventory') ? <Button variant="outline" onClick={() => { navigate('admin'); setAdminTab('inventory') }} className="min-h-10"><Boxes className="mr-2 h-4 w-4" />Inventario</Button> : null}</div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <Card className="min-w-0 border-border/70 shadow-sm"><CardHeader className="space-y-3 px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-3"><CardTitle className="text-base">Catálogo</CardTitle><Badge variant="outline">{productsForPos.length}</Badge></div><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={posSearch} onChange={(event) => setPosSearch(event.target.value)} placeholder="Buscar producto o código" className="h-11 pl-9" aria-label="Buscar producto o código" /></div><div className="flex gap-2 overflow-x-auto pb-1">{state.settings.pos.categories.filter((category) => category.visible).map((category) => <Button key={category.name} size="sm" variant={posCategory === category.name ? 'default' : 'outline'} onClick={() => setPosCategory(category.name)} className="min-h-11 shrink-0 rounded-full px-4">{category.name}</Button>)}</div></CardHeader><CardContent className="px-4 pb-5 sm:px-5"><div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">{productsForPos.map((product) => { const inCart = cartLines.find((line) => line.productId === product.id)?.quantity ?? 0; const low = product.stock <= product.minStock; return <button type="button" key={product.id} onClick={() => addToCart(product)} className="group flex min-h-40 min-w-0 flex-col justify-between rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] motion-reduce:transition-none sm:p-4"><div className="flex items-start justify-between gap-2"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Package className="h-5 w-5" /></div>{inCart > 0 ? <Badge className="max-w-[80px] truncate bg-primary px-2 text-[10px] text-primary-foreground">{inCart} en venta</Badge> : low ? <Badge className="border-amber-300 bg-amber-50 px-2 text-[10px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Bajo</Badge> : null}</div><div className="mt-4 min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-tight">{product.name}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{product.code} · {formatQuantity(product.stock)} {product.unit}</p></div><div className="mt-3 flex items-center justify-between gap-1"><span className="font-mono text-sm font-semibold tabular-nums text-primary">{formatMoney(product.priceCents, currency)}</span><Plus className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" /></div></button> })}</div>{productsForPos.length === 0 ? <EmptyState icon={<Search className="h-5 w-5" />} title="Sin coincidencias" message="Prueba otro término." /> : null}</CardContent></Card>
        <div className="hidden lg:block">{renderCartPanel()}</div>
      </div>
      <div className="fixed inset-x-3 bottom-[76px] z-20 lg:hidden"><Button onClick={() => setCartOpen(true)} className="min-h-12 w-full justify-between rounded-2xl px-4 shadow-lg" aria-label="Abrir carrito"><span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />{cartItemCount ? `${cartItemCount} artículos` : 'Carrito vacío'}</span><span className="font-mono tabular-nums">{formatMoney(cartTotal, currency)}</span></Button></div>
      {cartOpen ? <><button type="button" className="fixed inset-0 bottom-[72px] z-30 bg-foreground/25 lg:hidden" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" /><div className="fixed inset-x-0 bottom-[72px] z-40 max-h-[calc(100dvh-84px)] overflow-y-auto rounded-t-3xl bg-background p-3 shadow-2xl lg:hidden"><div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted-foreground/30" />{renderCartPanel()}</div></> : null}
    </div>
  }

  const renderMovementsView = () => {
    const isSales = movementTab === 'sales'
    const saleCount = state.sales.filter((sale) => sale.status === 'confirmed').length
    const purchaseMonth = state.purchases.filter((purchase) => purchase.status === 'confirmed').reduce((sum, purchase) => sum + purchase.totalCents, 0)
    const displayedRows = isSales ? filteredSales : filteredPurchases
    return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">Movimientos</p><p className="text-xs text-muted-foreground">Ventas, compras y reversos</p></div><Button onClick={() => { if (requirePermission('inventory', 'registrar compras')) openNewPurchase() }} className="min-h-11"><Plus className="mr-2 h-4 w-4" />Compra</Button></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4"><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Ventas</p><p className="mt-1 font-serif text-2xl tabular-nums">{saleCount}</p><p className="truncate text-[11px] text-muted-foreground">{formatMoney(confirmedSalesToday, currency)}</p></div><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Operaciones</p><p className="mt-1 font-serif text-2xl tabular-nums">{state.sales.length + state.purchases.length}</p></div><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Compras</p><p className="mt-1 truncate font-serif text-xl tabular-nums">{formatMoney(purchaseMonth, currency)}</p></div><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Borradores</p><p className="mt-1 font-serif text-2xl tabular-nums">{state.sales.filter((sale) => sale.status === 'draft').length + state.purchases.filter((purchase) => purchase.status === 'draft').length}</p></div></div><div className="flex gap-2 overflow-x-auto pb-1"><Button variant={isSales ? 'default' : 'outline'} onClick={() => { setMovementTab('sales'); setMovementStatus('all') }} className="min-h-11 shrink-0"><Receipt className="mr-2 h-4 w-4" />Ventas</Button><Button variant={!isSales ? 'default' : 'outline'} onClick={() => { setMovementTab('purchases'); setMovementStatus('all') }} className="min-h-11 shrink-0"><Boxes className="mr-2 h-4 w-4" />Compras</Button></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={movementSearch} onChange={(event) => setMovementSearch(event.target.value)} placeholder={isSales ? 'Buscar folio, cliente o método' : 'Buscar folio, proveedor o referencia'} className="h-11 pl-9" /></div><select value={movementStatus} onChange={(event) => setMovementStatus(event.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="all">Todos</option><option value="confirmed">Confirmadas</option><option value="draft">Borradores</option><option value="cancelled">Anuladas</option></select></div><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">{isSales ? 'Ventas' : 'Compras'}</CardTitle><CardDescription>{displayedRows.length} registros</CardDescription></div><ListFilter className="h-5 w-5 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-2 px-3 pb-3 sm:px-5">{displayedRows.map((record) => { const sale = isSales ? record as Sale : null; const purchase = !isSales ? record as Purchase : null; const owner = sale ? state.customers.find((customer) => customer.id === sale.customerId)?.name ?? 'Público general' : state.suppliers.find((supplier) => supplier.id === purchase?.supplierId)?.name ?? 'Sin proveedor'; return <button type="button" key={record.id} onClick={() => setSelectedMovement({ type: movementTab, id: record.id })} className="flex min-h-20 w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">{isSales ? <Receipt className="h-4 w-4" /> : <Boxes className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-xs font-semibold">{record.folio}</p><StatusBadge status={record.status} labels={state.settings.statusLabels} /></div><p className="mt-1 truncate text-sm">{owner}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{formatDateTimeLabel(record.date)} · {(sale?.paymentMethod ?? purchase?.reference) || 'Sin referencia'}</p></div><div className="text-right"><p className="font-mono text-sm font-semibold tabular-nums">{formatMoney(record.totalCents, currency)}</p><ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" /></div></button> })}{displayedRows.length === 0 ? <EmptyState icon={<List className="h-5 w-5" />} title="Sin movimientos" message="Ajusta los filtros o registra una operación." /> : null}</CardContent></Card></div>
  }

  const renderProductionView = () => {
    const orders = state.productionOrders
    const order = selectedProduction
    const availability = order ? order.requirements.map((requirement) => ({ ...requirement, stock: state.ingredients.find((ingredient) => ingredient.id === requirement.ingredientId)?.stock ?? 0 })).map((item) => ({ ...item, missing: Math.max(0, item.planned - item.stock) })) : []
    const hasMissing = availability.some((item) => item.missing > 0)
    return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">Producción</p><p className="text-xs text-muted-foreground">{orders.filter((item) => item.status === 'in_progress').length} activas · {lowStockCount} bajas</p></div><Button onClick={() => { if (requirePermission('production', 'crear órdenes de producción')) setProductionDialogOpen(true) }} className="min-h-11"><Plus className="mr-2 h-4 w-4" />Nueva orden</Button></div><div className="grid gap-4 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)]"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><div className="flex items-center justify-between"><div><CardTitle className="text-base">Órdenes</CardTitle><CardDescription>{orders.length} registradas</CardDescription></div><ClipboardList className="h-5 w-5 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-2 px-3 pb-3 sm:px-4">{orders.map((item) => <button type="button" key={item.id} onClick={() => { setSelectedProductionId(item.id); setActualConsumption(Object.fromEntries(item.requirements.map((requirement) => [requirement.ingredientId, String(requirement.actual || requirement.planned)]))); setActualOutput(item.actualOutput ? String(item.actualOutput) : '') }} className={`w-full rounded-xl border p-3 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.id === order?.id ? 'border-primary bg-primary/[0.04] shadow-sm' : 'border-border bg-card'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.folio} · {item.productName}</p><p className="mt-1 text-xs text-muted-foreground">{formatQuantity(item.plannedOutput)} previstas · {formatQuantity(item.actualOutput)} reales</p></div><StatusBadge status={item.status} labels={state.settings.statusLabels} /></div>{item.status === 'planned' && item.requirements.some((requirement) => (state.ingredients.find((ingredient) => ingredient.id === requirement.ingredientId)?.stock ?? 0) < requirement.planned) ? <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300"><AlertTriangle className="h-3.5 w-3.5" />Falta un insumo</p> : null}</button>)}</CardContent></Card>{order ? <Card className="border-border/70 shadow-sm"><CardHeader className="border-b border-border/70 px-4 py-4 sm:px-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{order.folio}</p><CardTitle className="mt-1 text-xl">{order.productName}</CardTitle><CardDescription>{formatQuantity(order.plannedOutput)} piezas · {formatDateTimeLabel(order.scheduledAt)}</CardDescription></div><StatusBadge status={order.status} labels={state.settings.statusLabels} /></div></CardHeader><CardContent className="space-y-4 px-4 py-4 sm:px-5"><div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border"><div className="bg-background p-3"><p className="text-[11px] text-muted-foreground">Avance</p><p className="mt-1 font-serif text-xl tabular-nums">{order.plannedOutput ? Math.round((order.actualOutput / order.plannedOutput) * 100) : 0}%</p></div><div className="bg-background p-3"><p className="text-[11px] text-muted-foreground">Costo</p><p className="mt-1 truncate font-serif text-lg tabular-nums">{formatMoney(order.requirements.reduce((sum, requirement) => sum + (state.ingredients.find((ingredient) => ingredient.id === requirement.ingredientId)?.costCents ?? 0) * requirement.planned, 0), currency)}</p></div><div className="bg-background p-3"><p className="text-[11px] text-muted-foreground">Saldo</p><p className={`mt-1 font-serif text-lg ${hasMissing ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{hasMissing ? 'Revisar' : 'Lista'}</p></div></div><div><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Insumos</h3><span className="text-[11px] text-muted-foreground">plan / saldo</span></div><div className="divide-y divide-border/70 rounded-xl border border-border">{availability.map((requirement) => <div key={requirement.ingredientId} className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-4"><div><p className="text-sm font-medium">{requirement.name}</p><p className={`text-xs ${requirement.missing > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>{requirement.unit} · {requirement.missing > 0 ? `faltan ${formatQuantity(requirement.missing)}` : 'disponible'}</p></div><div className="font-mono text-xs tabular-nums">{formatQuantity(requirement.planned)} / {formatQuantity(requirement.stock)}</div><div className="flex items-center gap-2 sm:justify-end"><Label htmlFor={`actual-${requirement.ingredientId}`} className="text-xs text-muted-foreground">Real</Label><Input id={`actual-${requirement.ingredientId}`} type="number" min="0" step="0.01" value={actualConsumption[requirement.ingredientId] ?? String(requirement.actual || requirement.planned)} onChange={(event) => setActualConsumption((current) => ({ ...current, [requirement.ingredientId]: event.target.value }))} className="h-10 w-24 text-right" disabled={order.status === 'completed' || order.status === 'cancelled'} /></div></div>)}</div></div>{order.notes ? <div className="rounded-xl bg-muted/70 p-3 text-sm text-muted-foreground">{renderMarkdown(order.notes)}</div> : null}{renderCustomFieldSummary('production', order.customFields)}</CardContent><CardFooter className="flex flex-col gap-2 border-t border-border/70 px-4 py-4 sm:flex-row sm:justify-end sm:px-5"><div className="flex w-full items-center gap-2 sm:w-auto"><Label htmlFor="actual-output" className="whitespace-nowrap text-xs text-muted-foreground">Producción real</Label><Input id="actual-output" type="number" min="0" step="1" value={actualOutput || (order.actualOutput ? String(order.actualOutput) : '')} onChange={(event) => setActualOutput(event.target.value)} placeholder={String(order.plannedOutput)} className="h-11 w-full sm:w-28" disabled={order.status === 'completed' || order.status === 'cancelled'} /></div><div className="flex w-full gap-2 sm:w-auto">{order.status === 'planned' ? <Button variant="outline" onClick={() => startProduction(order)} className="min-h-11 flex-1 sm:flex-none"><Play className="mr-2 h-4 w-4" />Iniciar</Button> : null}{order.status === 'in_progress' ? <Button onClick={() => setConfirmAction({ kind: 'complete', id: order.id })} className="min-h-11 flex-1 sm:flex-none"><Check className="mr-2 h-4 w-4" />Completar</Button> : null}</div></CardFooter></Card> : <EmptyState icon={<Factory className="h-5 w-5" />} title="Sin órdenes" message="Crea una orden para comenzar." action={<Button onClick={() => setProductionDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Crear orden</Button>} />}</div></div>
  }

  const renderCustomersView = () => {
    const profileSales = selectedCustomer ? state.sales.filter((sale) => sale.customerId === selectedCustomer.id && sale.status === 'confirmed') : []
    const profileSpend = profileSales.reduce((sum, sale) => sum + sale.totalCents, 0)
    return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">Clientes</p><p className="text-xs text-muted-foreground">{state.customers.length} perfiles</p></div><Button onClick={() => openCustomerEditor()} className="min-h-11"><UserRoundPlus className="mr-2 h-4 w-4" />Nuevo</Button></div><div className="grid gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Buscar cliente" className="h-11 pl-9" /></div></CardHeader><CardContent className="space-y-2 px-3 pb-3 sm:px-4">{filteredCustomers.map((customer) => <button type="button" key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedCustomer?.id === customer.id ? 'border-primary bg-primary/[0.04]' : 'border-border'}`}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{customer.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{customer.name}</p><p className="truncate text-xs text-muted-foreground">{customer.phone || customer.email || 'Sin contacto'}</p>{renderCustomFieldSummary('customers', customer.customFields)}</div><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>)}{filteredCustomers.length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="Sin clientes" message="Crea un cliente o cambia la búsqueda." /> : null}</CardContent></Card>{selectedCustomer ? <Card className="border-border/70 shadow-sm"><CardHeader className="border-b border-border/70 px-4 py-4 sm:px-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">{selectedCustomer.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><CardTitle className="truncate text-lg">{selectedCustomer.name}</CardTitle><CardDescription className="truncate">{selectedCustomer.phone || 'Sin teléfono'}{selectedCustomer.email ? ` · ${selectedCustomer.email}` : ''}</CardDescription></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><Button variant="outline" onClick={() => openCustomerEditor(selectedCustomer)} className="min-h-11"><Pencil className="mr-2 h-4 w-4" />Editar</Button><Button onClick={() => startSaleForCustomer(selectedCustomer.id)} className="min-h-11"><ShoppingCart className="mr-2 h-4 w-4" />Vender</Button></div></div></CardHeader><CardContent className="space-y-4 px-4 py-4 sm:px-5"><div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border"><div className="bg-background p-3"><p className="text-[11px] text-muted-foreground">Compras</p><p className="mt-1 font-serif text-2xl tabular-nums">{profileSales.length}</p></div><div className="bg-background p-3"><p className="text-[11px] text-muted-foreground">Acumulado</p><p className="mt-1 truncate font-serif text-lg tabular-nums">{formatMoney(profileSpend, currency)}</p></div><div className="bg-background p-3"><p className="text-[11px] text-muted-foreground">Alta</p><p className="mt-1 text-sm font-medium">{formatDateLabel(selectedCustomer.createdAt)}</p></div></div>{selectedCustomer.notes ? <div className="rounded-xl bg-muted/70 p-3 text-sm text-muted-foreground">{selectedCustomer.notes}</div> : null}{renderCustomFieldSummary('customers', selectedCustomer.customFields)}<div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Historial</h3><span className="text-xs text-muted-foreground">{profileSales.length}</span></div>{profileSales.length === 0 ? <EmptyState icon={<Receipt className="h-5 w-5" />} title="Sin compras" message="Las ventas asociadas aparecerán aquí." /> : <div className="divide-y divide-border/70 rounded-xl border border-border">{profileSales.map((sale) => <button type="button" key={sale.id} onClick={() => { setMovementTab('sales'); setSelectedMovement({ type: 'sales', id: sale.id }); setActiveView('movements') }} className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"><div><p className="font-mono text-xs font-semibold">{sale.folio}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateLabel(sale.date)} · {sale.paymentMethod}</p></div><span className="font-mono text-sm tabular-nums">{formatMoney(sale.totalCents, currency)}</span></button>)}</div>}</div></CardContent></Card> : <EmptyState icon={<User className="h-5 w-5" />} title="Selecciona un cliente" message="Elige un perfil para ver sus datos." />}</div></div>
  }

  const renderPreferencesView = () => {
    const sortedNavigation = [...state.settings.navigation].sort((a, b) => a.order - b.order)
    const visiblePosCategories = state.settings.pos.categories.filter((category) => category.visible)
    const accentHex: Record<AccentPalette, string> = { coral: '#ea580c', sage: '#059669', ocean: '#0284c7', plum: '#7c3aed', slate: '#475569' }
    const toggleDashboardKpi = (id: DashboardKpiId) => {
      const current = state.settings.dashboard.kpis
      const next = current.includes(id) ? current.filter((item) => item !== id) : current.length < 6 ? [...current, id] : current
      if (next.length === 0) return
      updateSettingsSection('dashboard', { kpis: next })
    }
    const toggleQuickAction = (id: QuickActionId) => {
      const current = state.settings.dashboard.quickActions
      updateSettingsSection('dashboard', { quickActions: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] })
    }
  const togglePosQuickAction = (id: QuickActionId) => {
      const current = state.settings.pos.quickActions
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      commit((previous) => ({ ...previous, settings: { ...previous.settings, pos: { ...previous.settings.pos, quickActions: next }, dashboard: { ...previous.settings.dashboard, quickActions: next } } }))
    }
    const togglePayment = (method: PaymentMethod) => {
      const current = state.settings.pos.enabledPaymentMethods
      if (current.includes(method) && current.length === 1) { showNotice({ tone: 'warning', title: 'Método requerido', message: 'Conserva al menos un método de pago habilitado.' }); return }
      updateSettingsSection('pos', { enabledPaymentMethods: current.includes(method) ? current.filter((item) => item !== method) : [...current, method] })
    }
    const updateBusinessDetail = (key: keyof BusinessDetails, value: string) => updateSettingsSection('businessDetails', { [key]: value })
    const renderPreferenceButton = (id: typeof preferenceSection, label: string, icon: React.ReactNode) => <Button variant={preferenceSection === id ? 'secondary' : 'ghost'} onClick={() => setPreferenceSection(id)} className={`min-h-11 shrink-0 justify-start gap-2 rounded-xl px-3 ${preferenceSection === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>{icon}{label}</Button>
    return <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Card className="h-fit border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Personalización</CardTitle><CardDescription>Se aplica al instante y queda en este dispositivo.</CardDescription></CardHeader><CardContent className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
        {renderPreferenceButton('identity', 'Identidad', <StoreIcon />)}{renderPreferenceButton('appearance', 'Apariencia', <Palette className="h-4 w-4" />)}{renderPreferenceButton('navigation', 'Navegación', <PanelLeft className="h-4 w-4" />)}{renderPreferenceButton('pos', 'Punto de venta', <ShoppingCart className="h-4 w-4" />)}{renderPreferenceButton('fields', 'Campos propios', <ListOrdered className="h-4 w-4" />)}{renderPreferenceButton('formats', 'Formatos', <Tag className="h-4 w-4" />)}{renderPreferenceButton('receipt', 'Recibos', <ReceiptText className="h-4 w-4" />)}{renderPreferenceButton('dashboard', 'Dashboard', <BarChart3 className="h-4 w-4" />)}{renderPreferenceButton('profiles', 'Perfiles locales', <UserCog className="h-4 w-4" />)}
      </CardContent></Card>
      <div className="min-w-0 space-y-4">
        {preferenceSection === 'identity' ? <div className="space-y-4"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Identidad del negocio</CardTitle><CardDescription>Estos datos aparecen en caja, recibos y la navegación.</CardDescription></CardHeader><CardContent className="space-y-4 px-4 pb-5 sm:px-5"><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]"><div><Label htmlFor="business-name">Nombre comercial</Label><Input id="business-name" value={state.settings.businessName} onChange={(event) => updateSetting('businessName', event.target.value)} className="mt-1 h-11" /></div><div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 p-3"><div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-primary/10 text-primary ring-1 ring-black/10 dark:ring-white/10">{state.settings.logoDataUrl ? <img src={state.settings.logoDataUrl} alt="Logo del negocio" className="h-full w-full object-cover" /> : <StoreIcon />}</div><input ref={logoUploadRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleLogoFile(file); event.currentTarget.value = '' }} /><Button variant="outline" onClick={() => logoUploadRef.current?.click()} className="min-h-11 w-full"><ImagePlus className="mr-2 h-4 w-4" />Subir logo</Button>{state.settings.logoDataUrl ? <Button variant="ghost" onClick={() => updateSetting('logoDataUrl', '')} className="min-h-10 w-full text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Quitar logo</Button> : null}<p className="text-center text-[10px] text-muted-foreground">PNG, JPEG, WebP o GIF · máximo 1 MB</p></div></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="currency">Moneda</Label><select id="currency" value={state.settings.currency} onChange={(event) => updateSetting('currency', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="MXN">MXN · Peso mexicano</option><option value="USD">USD · Dólar</option><option value="EUR">EUR · Euro</option><option value="COP">COP · Peso colombiano</option></select></div><div><Label htmlFor="tax-rate">Impuesto (%)</Label><Input id="tax-rate" type="number" min="0" max="100" step="0.01" value={state.settings.taxRate} onChange={(event) => updateSetting('taxRate', Number(event.target.value) || 0)} className="mt-1 h-11" /></div></div></CardContent></Card><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Datos para recibos</CardTitle></CardHeader><CardContent className="grid gap-4 px-4 pb-5 sm:grid-cols-2 sm:px-5">{([{ key: 'legalName', label: 'Razón social' }, { key: 'taxId', label: 'RFC o identificador fiscal' }, { key: 'phone', label: 'Teléfono' }, { key: 'email', label: 'Correo' }, { key: 'website', label: 'Sitio web' }] as { key: keyof BusinessDetails; label: string }[]).map((item) => <div key={item.key}><Label htmlFor={`business-${item.key}`}>{item.label}</Label><Input id={`business-${item.key}`} value={state.settings.businessDetails[item.key]} onChange={(event) => updateBusinessDetail(item.key, event.target.value)} className="mt-1 h-11" /></div>)}<div className="sm:col-span-2"><Label htmlFor="business-address">Dirección</Label><Textarea id="business-address" value={state.settings.businessDetails.address} onChange={(event) => updateBusinessDetail('address', event.target.value)} className="mt-1" /></div></CardContent></Card></div> : null}
        {preferenceSection === 'appearance' ? <div className="space-y-4"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Apariencia</CardTitle><CardDescription>Preferencias visuales locales, sin cambiar la hoja de estilos global.</CardDescription></CardHeader><CardContent className="space-y-5 px-4 pb-5 sm:px-5"><div><Label>Color de marca</Label><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">{accentPaletteOptions.map((option) => <Button key={option.value} variant={state.settings.accentPalette === option.value ? 'secondary' : 'outline'} onClick={() => updateSetting('accentPalette', option.value)} className="min-h-12 justify-start gap-2" style={{ color: accentHex[option.value] }}><span className={`h-4 w-4 rounded-full ${option.swatch}`} />{option.label}{state.settings.accentPalette === option.value ? <Check className="ml-auto h-4 w-4" /> : null}</Button>)}</div><p className="mt-2 text-xs text-muted-foreground">La marca seleccionada identifica acciones de personalización y el perfil activo.</p></div><div className="grid gap-4 sm:grid-cols-3"><div><Label htmlFor="theme-mode">Modo</Label><select id="theme-mode" value={state.settings.themeMode} onChange={(event) => updateSetting('themeMode', event.target.value as ThemeMode)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="light">Claro</option><option value="dark">Oscuro</option><option value="system">Sistema</option></select></div><div><Label htmlFor="density">Densidad</Label><select id="density" value={state.settings.density} onChange={(event) => updateSetting('density', event.target.value as DensityMode)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="comfortable">Cómoda</option><option value="compact">Compacta</option></select></div><div><Label htmlFor="text-size">Tamaño de texto</Label><select id="text-size" value={state.settings.textSize} onChange={(event) => updateSetting('textSize', event.target.value as TextSizeMode)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="standard">Estándar</option><option value="large">Grande</option></select></div></div><div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: accentHex[state.settings.accentPalette] }}><p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">Vista</p><p className={`mt-2 ${state.settings.textSize === 'large' ? 'text-lg' : 'text-base'} font-semibold`} style={{ color: accentHex[state.settings.accentPalette] }}>Tu operación, a tu manera</p><p className="mt-1 text-xs text-muted-foreground">La densidad y el tamaño se aplican en los controles de configuración.</p></div></CardContent></Card></div> : null}
        {preferenceSection === 'navigation' ? <Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Módulos y navegación</CardTitle><CardDescription>Reordena, muestra u oculta módulos. Siempre queda al menos uno visible.</CardDescription></CardHeader><CardContent className="space-y-2 px-4 pb-5 sm:px-5">{sortedNavigation.map((module, index) => <div key={module.id} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"><div className="flex items-center gap-2 text-muted-foreground"><GripVertical className="h-4 w-4" /><span className="font-mono text-xs">{String(index + 1).padStart(2, '0')}</span></div><div><Label htmlFor={`module-${module.id}`}>Etiqueta</Label><Input id={`module-${module.id}`} value={module.label} onChange={(event) => updateNavigation(module.id, { label: event.target.value })} className="mt-1 h-11" /></div><div className="flex items-end gap-1"><Button variant="outline" size="icon" onClick={() => moveNavigation(module.id, -1)} disabled={index === 0} className="h-11 w-11" aria-label={`Subir ${module.label}`}><MoveUp className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => moveNavigation(module.id, 1)} disabled={index === sortedNavigation.length - 1} className="h-11 w-11" aria-label={`Bajar ${module.label}`}><MoveDown className="h-4 w-4" /></Button></div><div className="flex items-center gap-2 sm:justify-end"><Label htmlFor={`visible-${module.id}`} className="text-xs">Visible</Label><Switch id={`visible-${module.id}`} checked={module.visible} onCheckedChange={(checked) => updateNavigation(module.id, { visible: checked })} /></div></div>)}</CardContent></Card> : null}
        {preferenceSection === 'pos' ? <div className="space-y-4"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Punto de venta</CardTitle><CardDescription>Lo que se muestra en caja cambia inmediatamente.</CardDescription></CardHeader><CardContent className="space-y-5 px-4 pb-5 sm:px-5"><div><p className="text-sm font-semibold">Categorías visibles</p><div className="mt-2 space-y-2">{state.settings.pos.categories.map((category, categoryIndex) => <div key={category.name} className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2"><span className="min-w-0 flex-1 text-sm">{category.name}</span>{category.name === 'Todos' ? <Badge variant="outline">Siempre</Badge> : <><Button variant="outline" size="icon" onClick={() => movePosCategory(category.name, -1)} disabled={categoryIndex === 1} className="h-10 w-10" aria-label={`Subir categoría ${category.name}`}><ChevronUp className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => movePosCategory(category.name, 1)} disabled={categoryIndex === state.settings.pos.categories.length - 1} className="h-10 w-10" aria-label={`Bajar categoría ${category.name}`}><ChevronDown className="h-4 w-4" /></Button><Switch checked={category.visible} onCheckedChange={(checked) => updateSettingsSection('pos', { categories: state.settings.pos.categories.map((item) => item.name === category.name ? { ...item, visible: checked } : item) })} aria-label={`Mostrar ${category.name}`} /></>}</div>)}</div><div className="mt-2 flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nueva categoría" className="h-11" /><Button variant="outline" onClick={addConfiguredCategory} className="min-h-11 shrink-0"><Plus className="mr-2 h-4 w-4" />Añadir</Button></div></div><div><p className="text-sm font-semibold">Métodos de pago</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{paymentOptions.map((method) => <div key={method} className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">{method}</span><Switch checked={state.settings.pos.enabledPaymentMethods.includes(method)} onCheckedChange={() => togglePayment(method)} aria-label={`Habilitar ${method}`} /></div>)}</div></div><div><p className="text-sm font-semibold">Acciones rápidas en caja</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{quickActionOptions.map((option) => <div key={option.id} className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">{option.label}</span><Switch checked={state.settings.pos.quickActions.includes(option.id)} onCheckedChange={() => togglePosQuickAction(option.id)} aria-label={`Mostrar ${option.label}`} /></div>)}</div></div><div><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">Orden de productos</p><span className="text-xs text-muted-foreground">Primero aparece arriba</span></div><div className="mt-2 space-y-2">{state.settings.pos.productOrder.map((productId, index) => { const product = state.products.find((item) => item.id === productId); if (!product) return null; return <div key={product.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-border px-3"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="min-w-0 flex-1 truncate text-sm">{product.name}</span><Button variant="outline" size="icon" onClick={() => { const next = [...state.settings.pos.productOrder]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateSettingsSection('pos', { productOrder: next }) }} disabled={index === 0} className="h-10 w-10" aria-label={`Subir ${product.name}`}><ChevronUp className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => { const next = [...state.settings.pos.productOrder]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; updateSettingsSection('pos', { productOrder: next }) }} disabled={index === state.settings.pos.productOrder.length - 1} className="h-10 w-10" aria-label={`Bajar ${product.name}`}><ChevronDown className="h-4 w-4" /></Button></div> })}</div></div></CardContent></Card></div> : null}
        {preferenceSection === 'fields' ? <Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Campos personalizados</CardTitle><CardDescription>Define datos extra para capturar y ver en cada entidad.</CardDescription></CardHeader><CardContent className="space-y-4 px-4 pb-5 sm:px-5"><div className="flex gap-2 overflow-x-auto pb-1">{(['products', 'customers', 'purchases', 'production'] as CustomFieldEntity[]).map((entity) => <Button key={entity} variant={customFieldEntity === entity ? 'default' : 'outline'} onClick={() => { setCustomFieldEntity(entity); setCustomFieldEditingId('') }} className="min-h-11 shrink-0">{entity === 'products' ? 'Productos' : entity === 'customers' ? 'Clientes' : entity === 'purchases' ? 'Compras' : 'Producción'}</Button>)}</div><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]"><div><Label htmlFor="field-label">Etiqueta</Label><Input id="field-label" value={customFieldForm.label} onChange={(event) => setCustomFieldForm((form) => ({ ...form, label: event.target.value }))} placeholder="Ej. Canal de venta" className="mt-1 h-11" /></div><div><Label htmlFor="field-type">Tipo</Label><select id="field-type" value={customFieldForm.type} onChange={(event) => setCustomFieldForm((form) => ({ ...form, type: event.target.value as CustomFieldType }))} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="text">Texto</option><option value="number">Número</option><option value="date">Fecha</option><option value="boolean">Sí / No</option><option value="select">Selección</option></select></div><div className="sm:col-span-2"><Label htmlFor="field-options">Opciones de selección</Label><Input id="field-options" value={customFieldForm.options} onChange={(event) => setCustomFieldForm((form) => ({ ...form, options: event.target.value }))} placeholder="Regular, Mayorista, Corporativo" disabled={customFieldForm.type !== 'select'} className="mt-1 h-11" /></div></div><div className="flex flex-wrap gap-2"><Button onClick={addCustomField} className="min-h-11"><Save className="mr-2 h-4 w-4" />{customFieldEditingId ? 'Actualizar campo' : 'Añadir campo'}</Button>{customFieldEditingId ? <Button variant="outline" onClick={() => { setCustomFieldEditingId(''); setCustomFieldForm({ label: '', type: 'text', options: '', active: true }) }} className="min-h-11">Cancelar edición</Button> : null}</div><div className="space-y-2">{state.settings.customFields[customFieldEntity].map((field) => <div key={field.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{field.label}</p><p className="text-xs text-muted-foreground">{field.type}{field.type === 'select' ? ` · ${field.options.join(', ')}` : ''}</p></div><Badge variant={field.active ? 'secondary' : 'outline'}>{field.active ? 'Activo' : 'Pausado'}</Badge><Button variant="outline" onClick={() => editCustomField(field)} className="min-h-11"><Pencil className="mr-2 h-4 w-4" />Editar</Button><Button variant="ghost" onClick={() => removeCustomField(field.id)} className="min-h-11 text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Quitar</Button></div>)}{state.settings.customFields[customFieldEntity].length === 0 ? <EmptyState icon={<ListOrdered className="h-5 w-5" />} title="Sin campos" message="Añade el primer campo para capturar información específica." /> : null}</div></CardContent></Card> : null}
        {preferenceSection === 'formats' ? <div className="space-y-4"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Folios y formatos</CardTitle><CardDescription>Los siguientes folios usan estos prefijos y contadores inmediatamente.</CardDescription></CardHeader><CardContent className="space-y-4 px-4 pb-5 sm:px-5"><div className="grid gap-3 sm:grid-cols-3">{([{ key: 'sale', label: 'Ventas', number: 'nextSaleNumber' }, { key: 'purchase', label: 'Compras', number: 'nextPurchaseNumber' }, { key: 'production', label: 'Producción', number: 'nextProductionNumber' }] as { key: keyof Settings['folioPrefixes']; label: string; number: keyof Settings }[]).map((item) => <div key={item.key} className="rounded-xl border border-border p-3"><Label htmlFor={`prefix-${item.key}`}>{item.label} · prefijo</Label><Input id={`prefix-${item.key}`} value={state.settings.folioPrefixes[item.key]} onChange={(event) => updateSettingsSection('folioPrefixes', { [item.key]: event.target.value })} className="mt-1 h-11" /><Label htmlFor={`number-${item.key}`} className="mt-3 block">Siguiente número</Label><Input id={`number-${item.key}`} type="number" min="1" value={state.settings[item.number] as number} onChange={(event) => updateSetting(item.number, Math.max(1, Number(event.target.value) || 1) as never)} className="mt-1 h-11" /></div>)}</div><div className="grid gap-4 sm:grid-cols-3"><div><Label htmlFor="date-format">Fecha</Label><select id="date-format" value={state.settings.dateFormat} onChange={(event) => updateSetting('dateFormat', event.target.value as Settings['dateFormat'])} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div><div><Label htmlFor="quantity-decimals">Decimales de cantidad</Label><Input id="quantity-decimals" type="number" min="0" max="4" value={state.settings.quantityDecimals} onChange={(event) => updateSetting('quantityDecimals', Math.min(4, Math.max(0, Number(event.target.value) || 0)))} className="mt-1 h-11" /></div><div><Label htmlFor="negative-stock">Existencias</Label><div className="mt-1 flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">Permitir negativas</span><Switch id="negative-stock" checked={state.settings.allowNegativeStock} onCheckedChange={(checked) => updateSetting('allowNegativeStock', checked)} /></div></div></div></CardContent></Card><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Unidades y categorías</CardTitle></CardHeader><CardContent className="grid gap-5 px-4 pb-5 sm:grid-cols-2 sm:px-5"><div><p className="text-sm font-semibold">Unidades</p><div className="mt-2 flex flex-wrap gap-2">{state.settings.units.map((unit) => <span key={unit} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">{unit}{state.settings.units.length > 1 ? <button type="button" onClick={() => updateSetting('units', state.settings.units.filter((item) => item !== unit))} className="rounded-full p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Quitar unidad ${unit}`}><X className="h-3 w-3" /></button> : null}</span>)}</div><div className="mt-3 flex gap-2"><Input value={newUnit} onChange={(event) => setNewUnit(event.target.value)} placeholder="Nueva unidad" className="h-11" /><Button variant="outline" onClick={addConfiguredUnit} className="min-h-11"><Plus className="h-4 w-4" /></Button></div></div><div><p className="text-sm font-semibold">Estados visibles</p><div className="mt-2 space-y-2">{Object.entries(state.settings.statusLabels).map(([key, value]) => <div key={key} className="flex items-center gap-2"><span className="w-24 shrink-0 font-mono text-[10px] text-muted-foreground">{key}</span><Input value={value} onChange={(event) => updateSetting('statusLabels', { ...state.settings.statusLabels, [key]: event.target.value })} className="h-10" /></div>)}</div></div></CardContent></Card></div> : null}
        {preferenceSection === 'receipt' ? <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Editor de recibo</CardTitle><CardDescription>La vista de comprobante y la impresión usan estos campos.</CardDescription></CardHeader><CardContent className="space-y-4 px-4 pb-5 sm:px-5"><div><Label htmlFor="receipt-header">Encabezado</Label><Textarea id="receipt-header" value={state.settings.receipt.header} onChange={(event) => updateSettingsSection('receipt', { header: event.target.value })} className="mt-1" /></div><div><Label htmlFor="receipt-footer">Pie</Label><Textarea id="receipt-footer" value={state.settings.receipt.footer} onChange={(event) => updateSettingsSection('receipt', { footer: event.target.value })} className="mt-1" /></div><div className="grid gap-2 sm:grid-cols-2">{([{ key: 'showLogo', label: 'Logo' }, { key: 'showBusinessDetails', label: 'Datos del negocio' }, { key: 'showCustomer', label: 'Cliente' }, { key: 'showPayment', label: 'Pago' }, { key: 'showTax', label: 'Impuesto' }, { key: 'showDiscount', label: 'Descuento' }, { key: 'showFolio', label: 'Folio' }, { key: 'showDate', label: 'Fecha' }] as { key: keyof ReceiptSettings; label: string }[]).map((item) => <div key={item.key} className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">{item.label}</span><Switch checked={Boolean(state.settings.receipt[item.key])} onCheckedChange={(checked) => updateSettingsSection('receipt', { [item.key]: checked })} aria-label={`Mostrar ${item.label}`} /></div>)}</div></CardContent></Card><Card className="h-fit border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Vista previa</CardTitle></CardHeader><CardContent className="rounded-b-xl bg-white px-5 pb-5 pt-1 text-slate-900"><div className="border-b border-dashed border-slate-300 py-4 text-center">{state.settings.receipt.showLogo && state.settings.logoDataUrl ? <img src={state.settings.logoDataUrl} alt="Logo en recibo" className="mx-auto mb-2 h-12 w-12 rounded-xl object-cover ring-1 ring-black/10" /> : null}<p className="font-semibold">{state.settings.businessName}</p>{state.settings.receipt.showBusinessDetails ? <p className="mt-1 whitespace-pre-line text-[10px] text-slate-500">{state.settings.businessDetails.address || 'Dirección del negocio'}{state.settings.businessDetails.phone ? ` · ${state.settings.businessDetails.phone}` : ''}</p> : null}{state.settings.receipt.header ? <p className="mt-2 whitespace-pre-line text-xs">{state.settings.receipt.header}</p> : null}</div><div className="space-y-2 py-4 text-xs"><div className="flex justify-between"><span>Pan campesino × 2</span><span>{formatMoney(15200, currency)}</span></div><div className="flex justify-between"><span>Café americano × 1</span><span>{formatMoney(4200, currency)}</span></div>{state.settings.receipt.showDiscount ? <div className="flex justify-between text-slate-500"><span>Descuento</span><span>−{formatMoney(0, currency)}</span></div> : null}{state.settings.receipt.showTax ? <div className="flex justify-between text-slate-500"><span>Impuesto</span><span>{formatMoney(0, currency)}</span></div> : null}</div><div className="border-t border-dashed border-slate-300 py-3 text-xs">{state.settings.receipt.showFolio ? <p>Folio V-{state.settings.nextSaleNumber}</p> : null}{state.settings.receipt.showDate ? <p>Fecha {formatDateByPattern(staticSeedDate, state.settings.dateFormat)}</p> : null}{state.settings.receipt.showPayment ? <p>Pago Efectivo</p> : null}{state.settings.receipt.showCustomer ? <p>Cliente Público general</p> : null}</div><p className="whitespace-pre-line border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-500">{state.settings.receipt.footer}</p></CardContent></Card></div> : null}
        {preferenceSection === 'dashboard' ? <Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Dashboard y acciones</CardTitle><CardDescription>Elige las métricas y accesos que aparecen sobre Punto de venta.</CardDescription></CardHeader><CardContent className="space-y-5 px-4 pb-5 sm:px-5"><div><p className="text-sm font-semibold">Tarjetas KPI</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{dashboardKpiOptions.map((option) => <div key={option.id} className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">{option.label}</span><Switch checked={state.settings.dashboard.kpis.includes(option.id)} onCheckedChange={() => toggleDashboardKpi(option.id)} aria-label={`Mostrar ${option.label}`} /></div>)}</div></div><div><p className="text-sm font-semibold">Acciones rápidas</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{quickActionOptions.map((option) => <div key={option.id} className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">{option.label}</span><Switch checked={state.settings.dashboard.quickActions.includes(option.id)} onCheckedChange={() => toggleQuickAction(option.id)} aria-label={`Mostrar ${option.label}`} /></div>)}</div></div></CardContent></Card> : null}
        {preferenceSection === 'profiles' ? <div className="space-y-4"><Card className="border-border/70 shadow-sm"><CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-4"><div><CardTitle className="text-base">Perfiles locales</CardTitle><CardDescription>PIN local para compartir el dispositivo. No es una cuenta.</CardDescription></div><Button onClick={() => openProfileEditor()} className="min-h-11 shrink-0"><UserRoundPlus className="mr-2 h-4 w-4" />Nuevo perfil</Button></CardHeader><CardContent className="space-y-2 px-4 pb-5 sm:px-5">{state.profiles.map((profile) => <div key={profile.id} className="rounded-xl border border-border p-3"><div className="flex flex-wrap items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UserCog className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{profile.name}</p>{profile.id === state.activeProfileId ? <Badge>Activo</Badge> : null}{!profile.active ? <Badge variant="outline">Inactivo</Badge> : null}</div><p className="mt-1 text-xs text-muted-foreground">{permissionOptions.filter((permission) => profile.permissions[permission.key]).map((permission) => permission.label).join(' · ') || 'Sin permisos operativos'}</p></div><div className="flex gap-1"><Button variant="outline" onClick={() => openProfileEditor(profile)} className="min-h-11"><Pencil className="mr-2 h-4 w-4" />Editar</Button><Switch checked={profile.active} onCheckedChange={(checked) => updateProfileStatus(profile.id, checked)} aria-label={`Activar ${profile.name}`} /></div></div></div>)}</CardContent></Card><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Configuración completa</CardTitle><CardDescription>Exporta o importa identidad, apariencia, módulos, campos y perfiles.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2 px-4 pb-5 sm:flex-row sm:flex-wrap sm:px-5"><Button variant="outline" onClick={downloadConfigurationTemplate} className="min-h-11"><Download className="mr-2 h-4 w-4" />Exportar configuración</Button><input ref={configInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleConfigurationFile(file); event.currentTarget.value = '' }} /><Button variant="outline" onClick={() => configInputRef.current?.click()} className="min-h-11"><Upload className="mr-2 h-4 w-4" />Importar configuración</Button><Button variant="ghost" onClick={prepareDefaultRestore} className="min-h-11 text-destructive hover:text-destructive"><RotateCcw className="mr-2 h-4 w-4" />Restablecer preferencias</Button></CardContent></Card></div> : null}
      </div>
    </div>
  }

  const renderAdminView = () => {
    const lowStockProducts = state.products.filter((product) => product.stock <= product.minStock)
    const lowStockIngredients = state.ingredients.filter((ingredient) => ingredient.stock <= ingredient.minStock)
    const adminTabs: { id: AdminTab; label: string; icon: typeof Tag }[] = [
      { id: 'catalog', label: 'Catálogo', icon: Tag },
      { id: 'inventory', label: 'Inventario', icon: Boxes },
      { id: 'imports', label: 'Archivos', icon: FileSpreadsheet },
      { id: 'backups', label: 'Respaldos', icon: Archive },
      { id: 'preferences', label: 'Ajustes', icon: SlidersHorizontal },
    ]
    const catalogTabs: { id: typeof catalogMode; label: string }[] = [
      { id: 'products', label: 'Productos' },
      { id: 'ingredients', label: 'Insumos' },
      { id: 'recipes', label: 'Recetas' },
      { id: 'suppliers', label: 'Proveedores' },
    ]
    const openCatalog = () => openCatalogEditor(catalogMode === 'products' ? 'product' : catalogMode === 'ingredients' ? 'ingredient' : catalogMode === 'recipes' ? 'recipe' : 'supplier')
    return <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">Administración</p><p className="text-xs text-muted-foreground">Catálogo, inventario y archivos</p></div><Button variant="outline" onClick={downloadJsonBackup} className="min-h-11"><Download className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Respaldo JSON</span><span className="sm:hidden">Respaldo</span></Button></div>
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" aria-label="Secciones de administración">{adminTabs.map((tab) => { const Icon = tab.icon; return <Button key={tab.id} variant={adminTab === tab.id ? 'default' : 'ghost'} onClick={() => setAdminTab(tab.id)} className="min-h-11 shrink-0 gap-2 px-3"><Icon className="h-4 w-4" />{tab.label}</Button> })}</div>
      {adminTab === 'catalog' ? <div className="space-y-3"><div className="flex items-center justify-between gap-2"><div className="flex min-w-0 gap-2 overflow-x-auto pb-1">{catalogTabs.map((tab) => <Button key={tab.id} size="sm" variant={catalogMode === tab.id ? 'secondary' : 'outline'} onClick={() => setCatalogMode(tab.id)} className="min-h-11 shrink-0">{tab.label}</Button>)}</div><Button onClick={openCatalog} className="min-h-11 shrink-0"><Plus className="mr-2 h-4 w-4" />Agregar</Button></div><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-3"><CardTitle className="text-base">{catalogTabs.find((tab) => tab.id === catalogMode)?.label}</CardTitle><Badge variant="outline">{catalogMode === 'products' ? state.products.length : catalogMode === 'ingredients' ? state.ingredients.length : catalogMode === 'recipes' ? state.recipes.length : state.suppliers.length}</Badge></div></CardHeader><CardContent className="space-y-2 px-3 pb-3 sm:px-5">{catalogMode === 'products' ? state.products.map((product) => <div key={product.id} className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Package className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="truncate text-xs text-muted-foreground">{product.code} · {formatQuantity(product.stock)} {product.unit} · {formatMoney(product.priceCents, currency)}</p>{renderCustomFieldSummary('products', product.customFields)}</div>{product.stock <= product.minStock ? <Badge className="hidden border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 sm:inline-flex">Bajo</Badge> : null}<Button variant="ghost" size="icon" onClick={() => openCatalogEditor('product', product.id)} aria-label={`Editar ${product.name}`} className="h-10 w-10"><Pencil className="h-4 w-4" /></Button></div>) : catalogMode === 'ingredients' ? state.ingredients.map((ingredient) => <div key={ingredient.id} className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3"><div className="rounded-xl bg-muted p-2 text-muted-foreground"><Boxes className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{ingredient.name}</p><p className="truncate text-xs text-muted-foreground">{ingredient.code} · {formatQuantity(ingredient.stock)} {ingredient.unit} · {formatMoney(ingredient.costCents, currency)}</p></div>{ingredient.stock <= ingredient.minStock ? <Badge className="hidden border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 sm:inline-flex">Bajo</Badge> : null}<Button variant="ghost" size="icon" onClick={() => openCatalogEditor('ingredient', ingredient.id)} aria-label={`Editar ${ingredient.name}`} className="h-10 w-10"><Pencil className="h-4 w-4" /></Button></div>) : catalogMode === 'recipes' ? state.recipes.map((recipe) => { const product = state.products.find((item) => item.id === recipe.productId); return <div key={recipe.id} className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3"><div className="rounded-xl bg-muted p-2 text-muted-foreground"><ClipboardList className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product?.name ?? 'Producto sin catálogo'}</p><p className="text-xs text-muted-foreground">Rinde {formatQuantity(recipe.yieldQuantity)} · {recipe.lines.length} insumos</p></div><Button variant="outline" onClick={() => openCatalogEditor('recipe', recipe.id)} className="min-h-11 px-3"><Pencil className="mr-2 h-4 w-4" />Editar</Button></div> }) : state.suppliers.map((supplier) => <div key={supplier.id} className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3"><div className="rounded-xl bg-muted p-2 text-muted-foreground"><Users className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{supplier.name}</p><p className="truncate text-xs text-muted-foreground">{supplier.phone || supplier.email || 'Sin contacto'}</p></div><Button variant="outline" onClick={() => openCatalogEditor('supplier', supplier.id)} className="min-h-11 px-3"><Pencil className="mr-2 h-4 w-4" />Editar</Button></div>)}</CardContent></Card></div> : null}
      {adminTab === 'inventory' ? <div className="space-y-3"><div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border"><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Bajas</p><p className="mt-1 font-serif text-2xl tabular-nums">{lowStockCount}</p></div><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Productos</p><p className="mt-1 font-serif text-2xl tabular-nums">{state.products.length}</p></div><div className="bg-card p-3"><p className="text-[10px] text-muted-foreground">Insumos</p><p className="mt-1 font-serif text-2xl tabular-nums">{state.ingredients.length}</p></div></div><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Ajustes manuales</CardTitle><CardDescription>{lowStockProducts.length + lowStockIngredients.length} artículos bajo mínimo</CardDescription></CardHeader><CardContent className="space-y-2 px-3 pb-3 sm:px-5"><div className="divide-y divide-border/70 rounded-xl border border-border">{[...state.products.map((item) => ({ ...item, kind: 'product' as const })), ...state.ingredients.map((item) => ({ ...item, kind: 'ingredient' as const }))].map((item) => <div key={item.id} className="flex min-h-16 items-center gap-3 px-3 py-2 sm:px-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.name}</p><p className="truncate text-xs text-muted-foreground">{item.code} · {formatQuantity(item.stock)} {item.unit} · mín. {formatQuantity(item.minStock)}</p></div><Button variant="outline" size="sm" onClick={() => { setAdjustItem({ kind: item.kind, id: item.id }); setAdjustAmount('0'); setAdjustReason(''); setAdjustDialogOpen(true) }} className="min-h-11 shrink-0 px-3"><ArrowUp className="mr-1 h-3.5 w-3.5" /><ArrowDown className="mr-1 h-3.5 w-3.5" />Ajustar</Button></div>)}</div></CardContent></Card></div> : null}
      {adminTab === 'imports' ? <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-3"><CardTitle className="text-base">Importar archivo</CardTitle><Badge variant="outline">{importStep}/4</Badge></div><div className="mt-3 grid grid-cols-4 gap-1">{['Cargar', 'Mapear', 'Validar', 'Aplicar'].map((label, index) => <div key={label} className={`flex min-w-0 items-center gap-1 text-[10px] ${importStep > index + 1 ? 'text-emerald-700 dark:text-emerald-300' : importStep === index + 1 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${importStep > index + 1 ? 'bg-emerald-100 dark:bg-emerald-950/60' : importStep === index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{importStep > index + 1 ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="truncate sm:text-xs">{label}</span></div>)}</div></CardHeader><CardContent className="space-y-4 px-4 pb-4 sm:px-5">{importStep === 1 ? <div className="space-y-4"><div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-4 py-8 text-center"><FileUp className="mx-auto h-8 w-8 text-primary" /><h3 className="mt-3 text-sm font-semibold">Selecciona CSV o XLSX</h3><p className="mt-1 text-xs text-muted-foreground">Se valida antes de modificar datos.</p><Button className="mt-4 min-h-11" onClick={() => importInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Elegir archivo</Button><input ref={importInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleImportFile(file); event.currentTarget.value = '' }} /></div><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-muted/70 p-3"><FileText className="h-4 w-4 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">Mapeo</p></div><div className="rounded-xl bg-muted/70 p-3"><TriangleAlert className="h-4 w-4 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">Conflictos</p></div><div className="rounded-xl bg-muted/70 p-3"><Database className="h-4 w-4 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">Respaldo</p></div></div></div> : null}{importStep === 2 ? <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 p-3"><div className="flex min-w-0 items-center gap-3"><FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{importFileName}</p><p className="text-xs text-muted-foreground">{importRows.length} filas · {importHeaders.length} columnas</p></div></div><Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()} className="min-h-11">Cambiar</Button><input ref={importInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleImportFile(file); event.currentTarget.value = '' }} /></div><div><Label>Módulo</Label><select value={importModule} onChange={(event) => { const module = event.target.value as ImportModule; setImportModule(module); setSelectedImportTemplateId(''); setTemplateName(''); setImportMapping(autoMapHeaders(importHeaders, importModules.find((item) => item.value === module)?.fields ?? [])) }} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">{importModules.map((module) => <option key={module.value} value={module.value}>{module.label}</option>)}</select></div><div className="grid gap-2 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"><div><Label htmlFor="mapping-template">Plantilla guardada</Label><select id="mapping-template" value={selectedImportTemplateId} onChange={(event) => selectImportTemplate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="">Sin plantilla</option>{state.settings.importTemplates.filter((template) => template.module === importModule).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></div><div><Label htmlFor="mapping-template-name">Nombre</Label><Input id="mapping-template-name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Ej. Productos del proveedor" className="mt-1 h-11" /></div><Button variant="outline" onClick={saveImportTemplate} className="mt-5 min-h-11"><Save className="mr-2 h-4 w-4" />Guardar</Button><Button variant="ghost" disabled={!selectedImportTemplateId} onClick={() => deleteImportTemplate(selectedImportTemplateId)} className="mt-5 min-h-11 text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Borrar</Button></div><div className="overflow-hidden rounded-xl border border-border"><div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,1fr)] gap-2 bg-muted/50 px-3 py-3 text-xs font-semibold"><span>Campo</span><span>Columna</span></div><div className="divide-y divide-border/70">{activeAdminModule.fields.map((field) => <div key={field} className="grid grid-cols-[minmax(0,1fr)_minmax(120px,1fr)] items-center gap-2 px-3 py-2"><span className="truncate text-xs font-medium">{field}</span><select value={importMapping[field] ?? ''} onChange={(event) => setImportMapping((mapping) => ({ ...mapping, [field]: event.target.value }))} className="h-10 min-w-0 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">No importar</option>{importHeaders.map((header) => <option key={header} value={header}>{header}</option>)}</select></div>)}</div></div><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => { setImportStep(1); setImportRows([]) }} className="min-h-11">Atrás</Button><Button onClick={runImportValidation} className="min-h-11">Validar <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div> : null}{importStep === 3 && importValidation ? <div className="space-y-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{([{ label: 'Nuevos', value: importValidation.added, tone: 'text-emerald-700 dark:text-emerald-300' }, { label: 'Actualizados', value: importValidation.updated, tone: 'text-primary' }, { label: 'Duplicados', value: importValidation.duplicated, tone: 'text-muted-foreground' }, { label: 'Sin cambios', value: importValidation.unchanged, tone: 'text-muted-foreground' }, { label: 'Inválidos', value: importValidation.invalid, tone: 'text-destructive' }, { label: 'Conflictos', value: importValidation.conflicts, tone: 'text-amber-700 dark:text-amber-300' }]).map((item) => <div key={item.label} className="rounded-xl bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">{item.label}</p><p className={`mt-1 font-serif text-2xl tabular-nums ${item.tone}`}>{item.value}</p></div>)}</div>{importConflicts.length > 0 ? <div className="rounded-xl border border-amber-300/70 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-950/30"><div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Conflictos pendientes</p><div className="mt-3 space-y-2">{importConflicts.map((conflict, index) => <div key={`${conflict.key}-${index}`} className="rounded-lg border border-amber-300/50 bg-background/80 p-3"><p className="text-xs font-semibold">{conflict.name}</p><p className="mt-1 text-xs text-muted-foreground">Local: {conflict.localValue} · Archivo: {conflict.fileValue}</p><div className="mt-2 grid grid-cols-3 gap-1"><Button size="sm" variant={conflict.choice === 'local' ? 'default' : 'outline'} onClick={() => updateConflictChoice(index, 'local')} className="min-h-11 px-2">Local</Button><Button size="sm" variant={conflict.choice === 'file' ? 'default' : 'outline'} onClick={() => updateConflictChoice(index, 'file')} className="min-h-11 px-2">Archivo</Button><Button size="sm" variant={conflict.choice === 'duplicate' ? 'default' : 'outline'} onClick={() => updateConflictChoice(index, 'duplicate')} className="min-h-11 px-2">Duplicar</Button></div></div>)}</div></div></div></div> : null}{importErrors.length > 0 ? <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /><div><p className="text-sm font-semibold">{importErrors.length} filas inválidas</p><Button variant="outline" size="sm" onClick={downloadImportErrors} className="mt-3 min-h-11"><FileDown className="mr-2 h-4 w-4" />Descargar errores</Button></div></div></div> : null}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><Button variant="outline" onClick={() => setImportStep(2)} className="min-h-11"><ArrowLeft className="mr-2 h-4 w-4" />Mapeo</Button><Button onClick={applyImport} disabled={importValidation.added + importValidation.updated === 0 && importValidation.conflicts === 0} className="min-h-11">Aplicar aprobados <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div> : null}{importStep === 4 ? <div className="space-y-4"><div className="rounded-2xl border border-emerald-300/70 bg-emerald-50/70 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/30"><CheckCircle2 className="mx-auto h-11 w-11 text-emerald-700 dark:text-emerald-300" /><h3 className="mt-3 text-lg font-semibold">Importación completada</h3><p className="mt-1 text-sm text-muted-foreground">{importResultMessage}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:justify-center"><Button variant="outline" onClick={() => { setImportStep(1); setImportFileName(''); setImportRows([]); setImportValidation(null) }} className="min-h-11">Importar otro</Button><Button onClick={() => setAdminTab('backups')} className="min-h-11">Ver respaldos</Button></div></div> : null}</CardContent></Card><div className="space-y-3"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Exportar</CardTitle></CardHeader><CardContent className="space-y-2 px-4 pb-4"><Button variant="outline" onClick={exportXlsx} className="min-h-11 w-full justify-start"><FileSpreadsheet className="mr-2 h-4 w-4" />Libro XLSX</Button>{importModules.map((module) => <Button key={module.value} variant="ghost" onClick={() => exportCsvModule(module.value)} className="min-h-11 w-full justify-start"><FileText className="mr-2 h-4 w-4" />CSV {module.label.toLowerCase()}</Button>)}<Button variant="ghost" onClick={downloadJsonBackup} className="min-h-11 w-full justify-start"><FileDown className="mr-2 h-4 w-4" />Respaldo JSON</Button></CardContent></Card><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Plantilla</CardTitle></CardHeader><CardContent className="px-4 pb-4"><Button variant="outline" onClick={() => downloadBlob(encodeCsv([{ id: '', code: '', name: '', category: '', unit: '', price: '', cost: '', stock: '', minStock: '', active: 'true' }]), 'plantilla-productos.csv', 'text/csv;charset=utf-8')} className="min-h-11 w-full"><Download className="mr-2 h-4 w-4" />CSV productos</Button></CardContent></Card></div></div> : null}
      {adminTab === 'backups' ? <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">Respaldos locales</CardTitle><CardDescription>{state.backups.length} copias internas</CardDescription></div><Database className="h-5 w-5 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-2 px-3 pb-3 sm:px-5">{state.backups.length === 0 ? <EmptyState icon={<Archive className="h-5 w-5" />} title="Sin copias internas" message="Importa o restaura para crear la primera." /> : state.backups.map((backup) => <div key={backup.id} className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{backup.source}</p><p className="truncate text-xs text-muted-foreground">{formatDateTimeLabel(backup.date)} · {backup.snapshot.products.length} productos · {backup.snapshot.sales.length} ventas</p></div><Button variant="outline" size="sm" onClick={() => downloadBlob(JSON.stringify(backup.snapshot, null, 2), `clarasoft-${backup.id}.json`, 'application/json;charset=utf-8')} className="min-h-11 shrink-0"><Download className="mr-2 h-4 w-4" />Descargar</Button></div>)}</CardContent></Card><Card className="border-border/70 shadow-sm"><CardHeader className="px-4 py-4"><CardTitle className="text-base">Restaurar</CardTitle></CardHeader><CardContent className="px-4 pb-4"><Button variant="outline" onClick={() => restoreInputRef.current?.click()} className="min-h-11 w-full"><Upload className="mr-2 h-4 w-4" />Elegir JSON</Button><input ref={restoreInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleRestoreFile(file); event.currentTarget.value = '' }} /><div className="mt-3 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><TriangleAlert className="mb-2 h-4 w-4" />Se crea una copia antes de reemplazar.</div></CardContent></Card></div> : null}
      {adminTab === 'preferences' ? renderPreferencesView() : null}
    </div>
  }

  const renderMainView = () => activeView === 'pos' ? renderPosView() : activeView === 'movements' ? renderMovementsView() : activeView === 'production' ? renderProductionView() : activeView === 'customers' ? renderCustomersView() : renderAdminView()

  return <div className={`min-h-screen bg-muted/30 text-foreground antialiased ${state.settings.textSize === 'large' ? 'text-[17px]' : 'text-sm'} ${state.settings.density === 'compact' ? 'tracking-tight' : ''}`}><div className="flex min-h-screen"><aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-background transition-transform md:sticky md:top-0 md:block md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex h-full flex-col px-4 py-5"><div className="flex items-center justify-between px-2"><div><p className="text-xl font-black tracking-tight">Clara<span className="text-primary">Soft</span></p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">operación local</p></div><Button variant="ghost" size="icon" className="h-11 w-11 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X className="h-4 w-4" /></Button></div><div className="mt-8 rounded-2xl bg-muted/70 p-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary"><StoreIcon /></span><div className="min-w-0"><p className="truncate text-xs font-semibold">{state.settings.businessName}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Perfil local</p></div></div></div><nav className="mt-7 space-y-1" aria-label="Navegación principal">{navigationItems.map((module) => <Button key={module.id} variant={activeView === module.id ? 'secondary' : 'ghost'} onClick={() => navigate(module.id)} className={`w-full justify-start gap-3 rounded-xl px-3 ${activeView === module.id ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground'}`}>{getNavIcon(module.id)}<span>{module.label}</span></Button>)}</nav><div className="mt-auto space-y-3"><div className="rounded-2xl border border-border bg-card p-3"><div className="flex items-start gap-2"><Database className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs font-semibold">Solo en este dispositivo</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Descarga respaldos para mover o recuperar tu operación.</p></div></div></div><div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" />Motor local activo</div></div></div></aside>{sidebarOpen ? <button type="button" className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" /> : null}<main className="min-w-0 flex-1 pb-20 md:pb-0"><header className="sticky top-0 z-20 border-b border-border bg-background/95 px-3 py-3 backdrop-blur sm:px-6"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="h-11 w-11 md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></Button><div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-lg font-semibold sm:text-xl">{pageTitle}</h1><span className="hidden rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline">Local-first</span></div><p className="truncate text-xs text-muted-foreground">{pageSubtitle}</p></div></div><div className="flex shrink-0 items-center gap-2"><div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground lg:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span>Guardado localmente</span>{pendingSyncCount > 0 ? <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">{pendingSyncCount} pendientes</Badge> : null}</div><div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5"><span className="text-xs font-medium sm:inline">Sample Data</span><Switch checked={state.sampleData} onCheckedChange={turnSampleData} aria-label="Sample Data" /></div><Button variant="outline" size="icon" className="h-11 w-11" onClick={() => { const next: ThemeMode = state.settings.themeMode === 'light' ? 'dark' : state.settings.themeMode === 'dark' ? 'system' : 'light'; updateSetting('themeMode', next) }} aria-label={`Tema ${state.settings.themeMode === 'light' ? 'oscuro' : state.settings.themeMode === 'dark' ? 'del sistema' : 'claro'}`}>{state.settings.themeMode === 'dark' ? <Sun className="h-4 w-4" /> : state.settings.themeMode === 'system' ? <Circle className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button><div className="flex items-center gap-2"><div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="hidden max-w-24 truncate text-xs sm:inline">{activeProfile?.name ?? 'Perfil local'}</span></div><Button variant="outline" onClick={() => { setSwitchProfileId(''); setSwitchPin(''); setSwitchProfileOpen(true) }} className="min-h-11 px-3" aria-label="Cambiar perfil"><LockKeyhole className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Cambiar</span></Button></div></div></div></header><div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">{storageError ? <div className="mb-4"><NoticeBanner notice={{ tone: 'error', title: 'Persistencia local no disponible', message: `${storageError} Descarga un respaldo antes de cerrar esta pestaña.` }} onDismiss={() => setStorageError('')} /></div> : null}{notice ? <div className="mb-4"><NoticeBanner notice={notice} onDismiss={() => setNotice(null)} /></div> : null}{!state.sampleData && state.products.length === 0 ? <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Info className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-sm font-semibold">Tu espacio está listo para comenzar</p><p className="mt-1 text-xs text-muted-foreground">Importa una plantilla o crea tu primer producto desde Administración → Catálogo.</p></div></div><Button size="sm" onClick={() => { setAdminTab('catalog'); setActiveView('admin') }}>Configurar catálogo</Button></div> : null}{renderMainView()}</div></main></div><nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden" aria-label="Navegación móvil"><div className="mx-auto grid max-w-lg gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(5, Math.max(1, navigationItems.length))}, minmax(0, 1fr))` }}>{navigationItems.map((module) => <Button key={module.id} variant="ghost" onClick={() => navigate(module.id)} className={`h-14 flex-col gap-1 rounded-xl px-1 text-[10px] ${activeView === module.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>{getNavIcon(module.id)}<span className="max-w-full truncate">{module.id === 'pos' ? 'Caja' : module.label}</span></Button>)}</div></nav>

    <Dialog open={receiptSale !== null} onOpenChange={(open) => { if (!open) setReceiptSale(null) }}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-md"><DialogHeader><DialogTitle>Comprobante {receiptSale?.folio}</DialogTitle><DialogDescription>Venta confirmada y existencias actualizadas localmente.</DialogDescription></DialogHeader>{receiptSale ? <div className="space-y-4"><div className="rounded-xl border border-border bg-card p-4 text-sm text-foreground"><div className="text-center">{state.settings.receipt.showLogo && state.settings.logoDataUrl ? <img src={state.settings.logoDataUrl} alt="Logo del negocio" className="mx-auto mb-2 h-12 w-12 rounded-xl object-cover ring-1 ring-black/10" /> : null}<p className="font-semibold">{state.settings.businessName}</p>{state.settings.receipt.showBusinessDetails ? <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{state.settings.businessDetails.legalName || ''}{state.settings.businessDetails.address ? `\n${state.settings.businessDetails.address}` : ''}{state.settings.businessDetails.phone ? `\n${state.settings.businessDetails.phone}` : ''}</p> : null}{state.settings.receipt.header ? <p className="mt-2 whitespace-pre-line text-xs">{state.settings.receipt.header}</p> : null}</div><div className="mt-4 space-y-2 border-y border-dashed border-border py-3">{receiptSale.lines.map((line) => <div key={line.productId} className="flex justify-between gap-3 text-sm"><span>{line.quantity} × {line.name}</span><span className="font-mono tabular-nums">{formatMoney(line.totalCents, currency)}</span></div>)}</div>{state.settings.receipt.showDiscount ? <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Descuento</span><span>−{formatMoney(receiptSale.discountCents, currency)}</span></div> : null}{state.settings.receipt.showTax ? <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Impuesto</span><span>{formatMoney(receiptSale.taxCents, currency)}</span></div> : null}<div className="mt-3 flex items-center justify-between border-t border-border pt-3"><span className="font-semibold">Total</span><span className="font-serif text-2xl tabular-nums">{formatMoney(receiptSale.totalCents, currency)}</span></div><div className="mt-3 space-y-1 text-xs text-muted-foreground">{state.settings.receipt.showFolio ? <p>Folio {receiptSale.folio}</p> : null}{state.settings.receipt.showDate ? <p>Fecha {formatDateByPattern(receiptSale.date, state.settings.dateFormat)}</p> : null}{state.settings.receipt.showPayment ? <p>Pago {receiptSale.paymentMethod}</p> : null}{state.settings.receipt.showCustomer ? <p>Cliente {state.customers.find((customer) => customer.id === receiptSale.customerId)?.name ?? 'Público general'}</p> : null}</div>{state.settings.receipt.footer ? <p className="mt-4 whitespace-pre-line border-t border-dashed border-border pt-3 text-center text-xs text-muted-foreground">{state.settings.receipt.footer}</p> : null}</div></div> : null}<DialogFooter className="flex-col-reverse gap-2 sm:flex-row"><Button variant="outline" onClick={() => { if (typeof window !== 'undefined') window.print() }}><Printer className="mr-2 h-4 w-4" />Imprimir</Button><Button onClick={() => setReceiptSale(null)}>Nueva venta</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-lg"><DialogHeader><DialogTitle>Ventas suspendidas</DialogTitle><DialogDescription>Retoma un carrito sin afectar existencias hasta cobrarlo.</DialogDescription></DialogHeader>{state.heldCarts.length === 0 ? <EmptyState icon={<Archive className="h-5 w-5" />} title="Sin carritos suspendidos" message="Usa Suspender desde Punto de venta para guardar una venta en curso." /> : <div className="space-y-2">{state.heldCarts.map((draft) => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><div><p className="text-sm font-semibold">{draft.lines.reduce((sum, line) => sum + line.quantity, 0)} piezas en carrito</p><p className="mt-1 text-xs text-muted-foreground">Guardada {formatDateTimeLabel(draft.createdAt)} · {formatMoney(draft.lines.reduce((sum, line) => sum + (state.products.find((product) => product.id === line.productId)?.priceCents ?? 0) * line.quantity, 0), currency)}</p></div><Button onClick={() => resumeCart(draft)}>Retomar</Button></div>)}</div>}<DialogFooter><Button variant="outline" onClick={() => setResumeDialogOpen(false)}>Cerrar</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={selectedMovement !== null} onOpenChange={(open) => { if (!open) setSelectedMovement(null) }}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-xl"><DialogHeader><DialogTitle>{selectedMovementSale?.folio ?? selectedMovementPurchase?.folio ?? 'Detalle'}</DialogTitle><DialogDescription>{selectedMovementSale ? 'Detalle de venta, pago y trazabilidad.' : 'Detalle de compra, proveedor y trazabilidad.'}</DialogDescription></DialogHeader>{selectedMovementSale ? <div className="space-y-4"><div className="grid gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Cliente</p><p className="mt-1 text-sm font-semibold">{state.customers.find((customer) => customer.id === selectedMovementSale.customerId)?.name ?? 'Público general'}</p></div><div><p className="text-xs text-muted-foreground">Estado</p><div className="mt-1"><StatusBadge status={selectedMovementSale.status} labels={state.settings.statusLabels} /></div></div><div><p className="text-xs text-muted-foreground">Fecha</p><p className="mt-1 text-sm">{formatDateTimeLabel(selectedMovementSale.date)}</p></div><div><p className="text-xs text-muted-foreground">Pago</p><p className="mt-1 text-sm">{selectedMovementSale.paymentMethod} · {formatMoney(selectedMovementSale.totalCents, currency)}</p></div></div>{renderCustomFieldSummary('customers', state.customers.find((customer) => customer.id === selectedMovementSale.customerId)?.customFields)}<div className="divide-y divide-border/70 rounded-xl border border-border">{selectedMovementSale.lines.map((line) => <div key={line.productId} className="flex justify-between gap-3 px-4 py-3 text-sm"><span>{line.quantity} × {line.name}</span><span className="font-mono tabular-nums">{formatMoney(line.totalCents, currency)}</span></div>)}</div>{selectedMovementSale.status === 'confirmed' ? <Button variant="destructive" onClick={() => setConfirmAction({ kind: 'reverse', id: selectedMovementSale.id })}><Ban className="mr-2 h-4 w-4" />Anular con reverso</Button> : <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">Esta venta ya fue anulada; su historial permanece disponible.</div>}</div> : selectedMovementPurchase ? <div className="space-y-4"><div className="grid gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Proveedor</p><p className="mt-1 text-sm font-semibold">{state.suppliers.find((supplier) => supplier.id === selectedMovementPurchase.supplierId)?.name ?? 'Sin proveedor'}</p></div><div><p className="text-xs text-muted-foreground">Estado</p><div className="mt-1"><StatusBadge status={selectedMovementPurchase.status} labels={state.settings.statusLabels} /></div></div><div><p className="text-xs text-muted-foreground">Referencia</p><p className="mt-1 text-sm">{selectedMovementPurchase.reference || '—'}</p></div><div><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 font-mono text-sm tabular-nums">{formatMoney(selectedMovementPurchase.totalCents, currency)}</p></div></div>{renderCustomFieldSummary('purchases', selectedMovementPurchase.customFields)}<div className="divide-y divide-border/70 rounded-xl border border-border">{selectedMovementPurchase.lines.map((line) => <div key={line.itemId} className="flex justify-between gap-3 px-4 py-3 text-sm"><span>{line.quantity} × {line.name}</span><span className="font-mono tabular-nums">{formatMoney(line.totalCents, currency)}</span></div>)}</div>{selectedMovementPurchase.status === 'confirmed' ? <Button variant="destructive" onClick={() => setConfirmAction({ kind: 'reverse', id: selectedMovementPurchase.id })}><Ban className="mr-2 h-4 w-4" />Anular con reverso</Button> : <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">Este movimiento no puede volver a afectar existencias.</div>}</div> : null}<DialogFooter><Button variant="outline" onClick={() => setSelectedMovement(null)}>Cerrar</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-2xl"><DialogHeader><DialogTitle>Registrar compra</DialogTitle><DialogDescription>Guarda un borrador o confirma para incrementar existencias.</DialogDescription></DialogHeader><div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="purchase-supplier">Proveedor opcional</Label><select id="purchase-supplier" value={purchaseSupplierId} onChange={(event) => setPurchaseSupplierId(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">Sin proveedor</option>{state.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div><div><Label htmlFor="purchase-reference">Referencia</Label><Input id="purchase-reference" value={purchaseReference} onChange={(event) => setPurchaseReference(event.target.value)} placeholder="Orden o remisión" className="mt-1" /></div></div>{renderCustomFieldEditor('purchases', purchaseCustomFields, setPurchaseCustomFields)}<div className="space-y-2"><div className="flex items-center justify-between"><Label>Productos e insumos</Label><Button variant="outline" size="sm" onClick={() => setPurchaseLines((lines) => [...lines, { itemId: '', itemKind: 'ingredient', quantity: '1', unitCost: '0' }])}><Plus className="mr-1.5 h-3.5 w-3.5" />Añadir línea</Button></div>{purchaseLines.map((line, index) => <div key={index} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[110px_minmax(0,1fr)_90px_100px_40px]"><select value={line.itemKind} onChange={(event) => updatePurchaseLine(index, { itemKind: event.target.value as 'product' | 'ingredient', itemId: '' })} className="h-10 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"><option value="ingredient">Insumo</option><option value="product">Producto</option></select><select value={line.itemId} onChange={(event) => updatePurchaseLine(index, { itemId: event.target.value })} className="h-10 min-w-0 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"><option value="">Seleccionar</option>{(line.itemKind === 'product' ? state.products : state.ingredients).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><Input type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => updatePurchaseLine(index, { quantity: event.target.value })} placeholder="Cantidad" className="h-10" /><Input inputMode="decimal" value={line.unitCost} onChange={(event) => updatePurchaseLine(index, { unitCost: event.target.value })} placeholder="Costo" className="h-10" /><Button variant="ghost" size="icon" onClick={() => setPurchaseLines((lines) => lines.filter((_, lineIndex) => lineIndex !== index))} aria-label="Quitar línea"><Trash2 className="h-4 w-4" /></Button></div>)}</div><div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">Total estimado</p><p className="font-serif text-2xl tabular-nums">{formatMoney(purchaseTotalCents, currency)}</p></div><div className="flex gap-2"><Button variant={purchaseMode === 'draft' ? 'secondary' : 'outline'} onClick={() => setPurchaseMode('draft')}>Guardar borrador</Button><Button variant={purchaseMode === 'confirmed' ? 'default' : 'outline'} onClick={() => setPurchaseMode('confirmed')}><Check className="mr-2 h-4 w-4" />Confirmar</Button></div></div></div><DialogFooter><Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>Cancelar</Button><Button onClick={savePurchase}>{purchaseMode === 'draft' ? 'Guardar borrador' : 'Confirmar compra'}</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={productionDialogOpen} onOpenChange={setProductionDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-lg"><DialogHeader><DialogTitle>Nueva orden de producción</DialogTitle><DialogDescription>La receta calculará los requerimientos antes de iniciar.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="production-product">Producto terminado</Label><select id="production-product" value={productionProductId} onChange={(event) => setProductionProductId(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">Seleccionar producto</option>{state.products.filter((product) => state.recipes.some((recipe) => recipe.productId === product.id)).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div><div><Label htmlFor="production-target">Cantidad objetivo</Label><Input id="production-target" type="number" min="1" value={productionTarget} onChange={(event) => setProductionTarget(event.target.value)} className="mt-1" /></div><div><Label htmlFor="production-notes">Notas</Label><Textarea id="production-notes" value={productionNotes} onChange={(event) => setProductionNotes(event.target.value)} placeholder="Turno, lote o indicación" className="mt-1" /></div>{renderCustomFieldEditor('production', productionCustomFields, setProductionCustomFields)}</div><DialogFooter><Button variant="outline" onClick={() => setProductionDialogOpen(false)}>Cancelar</Button><Button onClick={createProduction}>Crear orden</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-lg"><DialogHeader><DialogTitle>{customerEditingId ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle><DialogDescription>Solo se requieren los datos mínimos para operar.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="customer-name">Nombre</Label><Input id="customer-name" value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} className="mt-1" /></div><div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="customer-phone">Teléfono</Label><Input id="customer-phone" value={customerForm.phone} onChange={(event) => setCustomerForm((form) => ({ ...form, phone: event.target.value }))} className="mt-1" /></div><div><Label htmlFor="customer-email">Correo</Label><Input id="customer-email" type="email" value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} className="mt-1" /></div></div><div><Label htmlFor="customer-notes">Notas</Label><Textarea id="customer-notes" value={customerForm.notes} onChange={(event) => setCustomerForm((form) => ({ ...form, notes: event.target.value }))} className="mt-1" /></div>{renderCustomFieldEditor('customers', customerForm.customFields, (customFields) => setCustomerForm((form) => ({ ...form, customFields })))}</div><DialogFooter><Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>Cancelar</Button><Button onClick={saveCustomer}><Save className="mr-2 h-4 w-4" />Guardar cliente</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={catalogDialogType !== null} onOpenChange={(open) => { if (!open) setCatalogDialogType(null) }}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-xl"><DialogHeader><DialogTitle>{catalogDialogType === 'product' ? `${catalogEditingId ? 'Editar' : 'Nuevo'} producto` : catalogDialogType === 'ingredient' ? `${catalogEditingId ? 'Editar' : 'Nuevo'} insumo` : catalogDialogType === 'supplier' ? `${catalogEditingId ? 'Editar' : 'Nuevo'} proveedor` : `${catalogEditingId ? 'Editar' : 'Nueva'} receta`}</DialogTitle><DialogDescription>Los campos se guardan en el catálogo local.</DialogDescription></DialogHeader>{catalogDialogType === 'product' || catalogDialogType === 'ingredient' ? <div className="grid gap-4 sm:grid-cols-2"><div><Label>Código</Label><Input value={catalogForm.code} onChange={(event) => setCatalogForm((form) => ({ ...form, code: event.target.value }))} className="mt-1" /></div><div><Label>Nombre</Label><Input value={catalogForm.name} onChange={(event) => setCatalogForm((form) => ({ ...form, name: event.target.value }))} className="mt-1" /></div>{catalogDialogType === 'product' ? <><div><Label>Categoría</Label><select value={catalogForm.category} onChange={(event) => setCatalogForm((form) => ({ ...form, category: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">{state.settings.categories.map((category) => <option key={category}>{category}</option>)}</select></div><div><Label>Precio</Label><Input inputMode="decimal" value={catalogForm.price} onChange={(event) => setCatalogForm((form) => ({ ...form, price: event.target.value }))} className="mt-1" /></div></> : null}<div><Label>Unidad</Label><select value={catalogForm.unit} onChange={(event) => setCatalogForm((form) => ({ ...form, unit: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">{state.settings.units.map((unit) => <option key={unit}>{unit}</option>)}</select></div><div><Label>Costo</Label><Input inputMode="decimal" value={catalogForm.cost} onChange={(event) => setCatalogForm((form) => ({ ...form, cost: event.target.value }))} className="mt-1" /></div><div><Label>{catalogEditingId ? 'Existencia actual' : 'Existencia inicial'}</Label><Input type="number" value={catalogForm.stock} onChange={(event) => setCatalogForm((form) => ({ ...form, stock: event.target.value }))} disabled={Boolean(catalogEditingId)} className="mt-1" /></div><div><Label>Mínimo</Label><Input type="number" value={catalogForm.minStock} onChange={(event) => setCatalogForm((form) => ({ ...form, minStock: event.target.value }))} disabled={catalogDialogType !== 'product'} className="mt-1" /></div>{catalogDialogType === 'product' ? <div className="sm:col-span-2">{renderCustomFieldEditor('products', catalogForm.customFields, (customFields) => setCatalogForm((form) => ({ ...form, customFields })))}</div> : null}</div> : catalogDialogType === 'supplier' ? <div className="space-y-4"><div><Label>Nombre</Label><Input value={catalogForm.name} onChange={(event) => setCatalogForm((form) => ({ ...form, name: event.target.value }))} className="mt-1" /></div><div className="grid gap-3 sm:grid-cols-2"><div><Label>Teléfono</Label><Input value={catalogForm.phone} onChange={(event) => setCatalogForm((form) => ({ ...form, phone: event.target.value }))} className="mt-1" /></div><div><Label>Correo</Label><Input value={catalogForm.email} onChange={(event) => setCatalogForm((form) => ({ ...form, email: event.target.value }))} className="mt-1" /></div></div><div><Label>Notas</Label><Textarea value={catalogForm.notes} onChange={(event) => setCatalogForm((form) => ({ ...form, notes: event.target.value }))} className="mt-1" /></div></div> : <div className="space-y-4"><div><Label>Producto terminado</Label><select value={catalogForm.productId} onChange={(event) => setCatalogForm((form) => ({ ...form, productId: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option value="">Seleccionar</option>{state.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div><div><Label>Rendimiento</Label><Input type="number" min="1" value={catalogForm.yield} onChange={(event) => setCatalogForm((form) => ({ ...form, yield: event.target.value }))} className="mt-1" /></div><div className="space-y-2"><div className="flex items-center justify-between"><Label>Insumos</Label><Button variant="outline" size="sm" onClick={() => setRecipeLines((lines) => [...lines, { ingredientId: '', quantity: '1' }])}><Plus className="mr-1.5 h-3.5 w-3.5" />Añadir</Button></div>{recipeLines.map((line, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_100px_40px] gap-2"><select value={line.ingredientId} onChange={(event) => setRecipeLines((lines) => lines.map((current, lineIndex) => lineIndex === index ? { ...current, ingredientId: event.target.value } : current))} className="h-10 min-w-0 rounded-lg border border-border bg-background px-2 text-xs"><option value="">Seleccionar insumo</option>{state.ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select><Input type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => setRecipeLines((lines) => lines.map((current, lineIndex) => lineIndex === index ? { ...current, quantity: event.target.value } : current))} className="h-10" /><Button variant="ghost" size="icon" onClick={() => setRecipeLines((lines) => lines.filter((_, lineIndex) => lineIndex !== index))} aria-label="Quitar insumo"><Trash2 className="h-4 w-4" /></Button></div>)}</div></div>}<DialogFooter><Button variant="outline" onClick={() => setCatalogDialogType(null)}>Cancelar</Button><Button onClick={saveCatalogItem}><Save className="mr-2 h-4 w-4" />Guardar</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-md"><DialogHeader><DialogTitle>Ajustar inventario</DialogTitle><DialogDescription>{selectedAdjustItem?.name ?? 'Selecciona un artículo'} · los cambios quedan auditados.</DialogDescription></DialogHeader><div className="space-y-4"><div className="rounded-xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Existencia actual</p><p className="mt-1 font-serif text-3xl tabular-nums">{formatQuantity(selectedAdjustItem?.stock ?? 0)} <span className="font-sans text-sm text-muted-foreground">{selectedAdjustItem?.unit}</span></p></div><div><Label htmlFor="adjust-amount">Variación</Label><Input id="adjust-amount" type="number" step="0.01" value={adjustAmount} onChange={(event) => setAdjustAmount(event.target.value)} className="mt-1" /><p className="mt-1 text-xs text-muted-foreground">Usa positivo para entrada y negativo para salida.</p></div><div><Label htmlFor="adjust-reason">Motivo</Label><Textarea id="adjust-reason" value={adjustReason} onChange={(event) => setAdjustReason(event.target.value)} placeholder="Merma, conteo físico, recepción…" className="mt-1" /></div></div><DialogFooter><Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>Cancelar</Button><Button onClick={saveAdjustment}><Save className="mr-2 h-4 w-4" />Guardar ajuste</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={confirmAction !== null} onOpenChange={(open) => { if (!open) setConfirmAction(null) }}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-md"><DialogHeader><DialogTitle>{confirmAction?.kind === 'complete' ? 'Completar orden' : confirmAction?.kind === 'restore' ? 'Restaurar respaldo' : 'Confirmar reverso'}</DialogTitle><DialogDescription>{confirmAction?.kind === 'complete' ? 'Se descontarán los consumos reales y se incrementará el producto terminado en una sola operación.' : 'Esta acción requiere confirmación porque modifica existencias y no borra el historial.'}</DialogDescription></DialogHeader><div className="rounded-xl border border-amber-300/70 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><TriangleAlert className="mb-2 h-4 w-4" />Revisa los datos antes de continuar. La operación quedará registrada localmente.</div><DialogFooter><Button variant="outline" onClick={() => setConfirmAction(null)}>Volver</Button><Button variant={confirmAction?.kind === 'reverse' ? 'destructive' : 'default'} onClick={() => { if (!confirmAction) return; if (confirmAction.kind === 'complete' && selectedProduction) completeProduction(selectedProduction); else if (confirmAction.kind === 'reverse' && selectedMovement) reverseMovement(selectedMovement.type, selectedMovement.id) }}>{confirmAction?.kind === 'complete' ? 'Completar orden' : 'Confirmar'}</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={switchProfileOpen} onOpenChange={setSwitchProfileOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-md"><DialogHeader><DialogTitle>Cambiar perfil local</DialogTitle><DialogDescription>Verifica el PIN del perfil elegido. El PIN nunca se muestra.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="switch-profile">Perfil</Label><select id="switch-profile" value={switchProfileId} onChange={(event) => setSwitchProfileId(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="">Seleccionar perfil</option>{state.profiles.filter((profile) => profile.active).map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></div><div><Label htmlFor="switch-pin">PIN</Label><Input id="switch-pin" type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={switchPin} onChange={(event) => setSwitchPin(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="••••" className="mt-1 h-11" /></div><div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground"><LockKeyhole className="mb-2 h-4 w-4 text-primary" />El acceso es local al navegador y solo cambia los permisos operativos disponibles.</div></div><DialogFooter><Button variant="outline" onClick={() => setSwitchProfileOpen(false)}>Cancelar</Button><Button onClick={() => void verifyProfileSwitch()} disabled={!switchProfileId || switchPin.length < 4} className="min-h-11"><Check className="mr-2 h-4 w-4" />Verificar PIN</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-lg"><DialogHeader><DialogTitle>{profileEditingId ? 'Editar perfil local' : 'Nuevo perfil local'}</DialogTitle><DialogDescription>Guarda un PIN de 4 a 8 dígitos; solo se conserva su digest.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="profile-name">Nombre</Label><Input id="profile-name" value={profileForm.name} onChange={(event) => setProfileForm((form) => ({ ...form, name: event.target.value }))} className="mt-1 h-11" /></div><div><Label htmlFor="profile-pin">{profileEditingId ? 'Nuevo PIN opcional' : 'PIN'}</Label><Input id="profile-pin" type="password" inputMode="numeric" autoComplete="new-password" maxLength={8} value={profileForm.pin} onChange={(event) => setProfileForm((form) => ({ ...form, pin: event.target.value.replace(/\D/g, '').slice(0, 8) }))} placeholder={profileEditingId ? 'Dejar vacío para conservarlo' : '••••'} className="mt-1 h-11" /></div><div className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3"><span className="text-sm">Perfil activo</span><Switch checked={profileForm.active} onCheckedChange={(checked) => setProfileForm((form) => ({ ...form, active: checked }))} /></div><div><p className="text-sm font-semibold">Permisos</p><div className="mt-2 space-y-2">{permissionOptions.map((permission) => <div key={permission.key} className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border px-3"><div className="min-w-0"><p className="text-sm font-medium">{permission.label}</p><p className="truncate text-[11px] text-muted-foreground">{permission.description}</p></div><Switch checked={profileForm.permissions[permission.key]} onCheckedChange={(checked) => setProfileForm((form) => ({ ...form, permissions: { ...form.permissions, [permission.key]: checked } }))} aria-label={`Permiso ${permission.label}`} /></div>)}</div></div></div><DialogFooter><Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancelar</Button><Button onClick={() => void saveProfile()} className="min-h-11"><Save className="mr-2 h-4 w-4" />Guardar perfil</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={templatePreview !== null} onOpenChange={(open) => { if (!open) setTemplatePreview(null) }}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-lg"><DialogHeader><DialogTitle>Vista previa de configuración</DialogTitle><DialogDescription>{templatePreview?.fileName ?? 'Plantilla JSON'} · no se ha aplicado todavía.</DialogDescription></DialogHeader>{templatePreview ? <div className="space-y-3"><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Módulos</p><p className="mt-1 font-serif text-2xl tabular-nums">{templatePreview.template.settings.navigation.length}</p></div><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Campos propios</p><p className="mt-1 font-serif text-2xl tabular-nums">{Object.values(templatePreview.template.settings.customFields).reduce((sum, fields) => sum + fields.length, 0)}</p></div><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Plantillas de mapeo</p><p className="mt-1 font-serif text-2xl tabular-nums">{templatePreview.template.settings.importTemplates.length}</p></div><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Perfiles</p><p className="mt-1 font-serif text-2xl tabular-nums">{templatePreview.template.profiles.length}</p></div></div><div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">Se reemplazarán preferencias, campos, mapeos y perfiles. Productos, clientes, ventas, compras y producción actuales se conservarán.</div></div> : null}<DialogFooter><Button variant="outline" onClick={() => setTemplatePreview(null)}>Cancelar</Button><Button onClick={applyConfigurationTemplate}>Aplicar plantilla</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}><DialogContent className="bottom-0 top-auto max-h-[calc(100dvh-1rem)] translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none sm:bottom-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-md"><DialogHeader><DialogTitle>Vista previa de restauración</DialogTitle><DialogDescription>{restorePreview?.fileName ?? 'Respaldo JSON'} · aún no se ha reemplazado ningún dato.</DialogDescription></DialogHeader>{restorePreview ? <div className="space-y-3"><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Productos</p><p className="mt-1 font-serif text-2xl tabular-nums">{restorePreview.snapshot.products.length}</p></div><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Ventas</p><p className="mt-1 font-serif text-2xl tabular-nums">{restorePreview.snapshot.sales.length}</p></div><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Compras</p><p className="mt-1 font-serif text-2xl tabular-nums">{restorePreview.snapshot.purchases.length}</p></div><div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Clientes</p><p className="mt-1 font-serif text-2xl tabular-nums">{restorePreview.snapshot.customers.length}</p></div></div><div className="rounded-xl border border-amber-300/70 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><TriangleAlert className="mb-2 h-4 w-4" />La restauración reemplazará los datos actuales de este dispositivo y conservará una copia previa.</div></div> : null}<DialogFooter><Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>Cancelar</Button><Button onClick={confirmRestore}>Restaurar respaldo</Button></DialogFooter></DialogContent></Dialog>
  </div>
}

function StoreIcon() {
  return <span className="text-xs font-black">CS</span>
}
