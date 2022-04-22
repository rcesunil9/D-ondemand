import gql from 'graphql-tag'

export const BRANDS = {
   AGGREGATE: gql`
      subscription brands {
         brandsAggregate(where: { isArchived: { _eq: false } }) {
            aggregate {
               count
            }
         }
      }
   `,
   LIST: gql`
      subscription brands {
         brands: brandsAggregate(where: { isArchived: { _eq: false } }) {
            aggregate {
               count(columns: id)
            }
            nodes {
               id
               domain
               title
               isDefault
               isPublished
               created_at
            }
         }
      }
   `,
   BRAND: gql`
      subscription brand($id: Int!) {
         brand(id: $id) {
            id
            domain
            title
            isDefault
            isPublished
            parseurMailBoxId
         }
      }
   `,
   CREATE_BRAND: gql`
      mutation createBrand($object: brands_brand_insert_input!) {
         createBrand(object: $object) {
            id
         }
      }
   `,
   CREATE_BRANDS: gql`
      mutation createBrands($objects: [brands_brand_insert_input!]!) {
         createBrands(objects: $objects) {
            returning {
               id
               domain
            }
            affected_rows
         }
      }
   `,
   UPDATE_BRAND: gql`
      mutation updateBrand($id: Int!, $_set: brands_brand_set_input!) {
         updateBrand(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
   SETTINGS_TYPES: gql`
      subscription brandSettings {
         brandSettings {
            id
            type
            identifier
         }
      }
   `,
   UPDATE_BRAND_SETTING: gql`
      mutation upsertBrandSetting(
         $object: brands_brand_brandSetting_insert_input!
      ) {
         upsertBrandSetting: insert_brands_brand_brandSetting_one(
            object: $object
            on_conflict: {
               constraint: brand_brandSetting_pkey
               update_columns: value
            }
         ) {
            value
         }
      }
   `,

   SETTING: gql`
      subscription brandSettings($brandId: Int!) {
         brands_brand_brandSetting(
            where: {
               _and: {
                  brandId: { _eq: $brandId }
                  brandSetting: { isDynamicForm: { _eq: true } }
               }
            }
         ) {
            brandId
            value
            brandSetting {
               id
               identifier
               type
               isDynamicForm
            }
         }
      }
   `,

   //for seo settings(lazy query)
   SETTINGS: gql`
      query brandSettings(
         $identifier: String_comparison_exp!
         $type: String_comparison_exp!
         $brandId: Int_comparison_exp!
      ) {
         brandSettings(where: { identifier: $identifier, type: $type }) {
            id
            brand: brand_brandSettings(where: { brandId: $brandId }) {
               brandId
               value
            }
            configTemplate
         }
      }
   `,
   UPSERT_BRAND_COLLECTION: gql`
      mutation upsertBrandCollection(
         $object: onDemand_brand_collection_insert_input!
      ) {
         upsertBrandCollection: createBrandCollection(
            object: $object
            on_conflict: {
               constraint: shop_collection_pkey
               update_columns: isActive
            }
         ) {
            isActive
         }
      }
   `,
   UPSERT_BRAND_TITLE: gql`
      mutation upsertBrandTitle(
         $object: subscription_brand_subscriptionTitle_insert_input!
      ) {
         upsertBrandTitle: insert_subscription_brand_subscriptionTitle_one(
            object: $object
            on_conflict: {
               constraint: shop_subscriptionTitle_pkey
               update_columns: isActive
            }
         ) {
            isActive
         }
      }
   `,
}

export const COLLECTIONS = {
   LIST: gql`
      subscription collections($brandId: Int_comparison_exp!) {
         collections: collectionsAggregate {
            aggregate {
               count(columns: id)
            }
            nodes {
               id
               name
               details {
                  productsCount
                  categoriesCount
               }
               totalBrands: brands_aggregate {
                  aggregate {
                     count(columns: brandId)
                  }
               }
               brands(where: { brandId: $brandId }) {
                  isActive
               }
            }
         }
      }
   `,
}

export const PLANS = {
   LIST: gql`
      subscription titles($brandId: Int_comparison_exp!) {
         titles: subscription_subscriptionTitle_aggregate {
            aggregate {
               count
            }
            nodes {
               id
               title
               totalBrands: brands_aggregate {
                  aggregate {
                     count(columns: brandId)
                  }
               }
               brands(where: { brandId: $brandId }) {
                  isActive
               }
            }
         }
      }
   `,
}

export const LOCATIONS = {
   AGGREGATE: gql`
      subscription locations {
         brands_location_aggregate {
            aggregate {
               count
            }
         }
      }
   `,
   LIST: gql`
      subscription locations($identifier: String!) {
         brands_location(order_by: { id: asc }) {
            id
            label
            isActive
            brand_locations {
               brandId
               brand {
                  title
                  brand_brandSettings(
                     where: {
                        brandSetting: { identifier: { _eq: $identifier } }
                     }
                  ) {
                     value
                  }
               }
            }
            locationTables {
               id
            }
            locationAddress
            lng
            lat
            country
            city
            state
            zipcode
         }
      }
   `,
   DELETE: gql`
      mutation deleteLocation($id: Int!) {
         delete_brands_location(where: { id: { _eq: $id } }) {
            affected_rows
         }
      }
   `,
   CREATE: gql`
      mutation createLocation($objects: [brands_location_insert_input!]!) {
         insert_brands_location(objects: $objects) {
            affected_rows
            returning {
               id
               locationAddress
               label
            }
         }
      }
   `,
   UPDATE: gql`
      mutation updateLocation($_set: brands_location_set_input!, $id: Int!) {
         update_brands_location(where: { id: { _eq: $id } }, _set: $_set) {
            affected_rows
         }
      }
   `,
   VIEW: gql`
      subscription viewLocation($id: Int!) {
         brands_location(where: { id: { _eq: $id } }) {
            locationAddress
            id
            lat
            lng
            city
            state
            country
            zipcode
            isActive
            label
         }
      }
   `,
}
export const BRAND_LOCATION = {
   VIEW: gql`
      subscription linkedBrands($locationId: Int!, $identifier: String!) {
         brands_brand_location(
            where: { locationId: { _eq: $locationId } }
            order_by: { brand: { title: asc, created_at: asc_nulls_first } }
         ) {
            brandId
            doesDeliver
            doesDeliverOutsideCity
            doesDeliverOutsideState
            doesDinein
            doesPickup
            isActive
            locationId
            location {
               label
            }
            brand {
               id
               title
               brand_brandSettings(
                  where: { brandSetting: { identifier: { _eq: $identifier } } }
               ) {
                  value
               }
            }
         }
      }
   `,
   UPDATE_BRAND: gql`
      mutation insertBrandLocation(
         $objects: [brands_brand_location_insert_input!]!
      ) {
         insert_brands_brand_location(
            objects: $objects
            on_conflict: { constraint: brand_location_locationId_brandId_key }
         ) {
            affected_rows
         }
      }
   `,
   UPDATE: gql`
      mutation updateBrandLocation(
         $_set: brands_brand_location_set_input!
         $brandId: Int!
         $locationId: Int!
      ) {
         update_brands_brand_location(
            where: {
               locationId: { _eq: $locationId }
               brandId: { _eq: $brandId }
            }
            _set: $_set
         ) {
            affected_rows
         }
      }
   `,
}
export const BRAND_ID_LIST = gql`
   subscription brandId($identifier: String!, $locationId: Int!) {
      brandsAggregate(
         order_by: { title: asc }
         where: {
            _not: { brand_locations: { locationId: { _eq: $locationId } } }
         }
      ) {
         aggregate {
            count
         }
         nodes {
            title
            id
            domain
            brand_brandSettings(
               where: { brandSetting: { identifier: { _eq: $identifier } } }
            ) {
               value
            }
         }
      }
   }
`

// getting brandSettingId using identifier
export const BRAND_ID = gql`
   query MyQuery($identifier: String_comparison_exp!) {
      brands_brand_brandSetting(
         where: { brandSetting: { identifier: $identifier } }
         limit: 1
      ) {
         brandSettingId
      }
   }
`
export const KIOSK = {
   AGGREGATE: gql`
      subscription MySubscription {
         brands_locationKiosk_aggregate {
            aggregate {
               count
            }
         }
      }
   `,
   LIST: gql`
      subscription MySubscription {
         kiosk: brands_locationKiosk_aggregate {
            aggregate {
               count
            }
            nodes {
               id
               accessUrl
               KioskLabel: internalLocationKioskLabel
               printerId
               isActive
            }
         }
      }
   `,
   KIOSK: gql`
      subscription Kiosk($id: Int_comparison_exp!) {
         kiosk: brands_locationKiosk(where: { id: $id }) {
            id
            accessUrl
            accessPassword
            kioskLabel: internalLocationKioskLabel
            isActive
            printerId
            location {
               city
               id
            }
         }
      }
   `,
   CREATE_KIOSK: gql`
      mutation CREATE_KIOSK($object: brands_locationKiosk_insert_input!) {
         insert_brands_locationKiosk_one(object: $object) {
            id
         }
      }
   `,
   CREATE_KIOSKS: gql`
      mutation CREATE_KIOSKS($objects: [brands_locationKiosk_insert_input!]!) {
         insert_brands_locationKiosk(objects: $objects) {
            returning {
               id
            }
            affected_rows
         }
      }
   `,
   PRINTERS: gql`
      subscription MySubscription {
         printers {
            name
            printNodeId
         }
      }
   `,

   LOCATIONS: gql`
      subscription locationList {
         locations: brands_location {
            id
            city
            isActive
            lat
            lng
            label
         }
      }
   `,

   GET_KIOSKS: gql`
      query GET_KIOSK($id: Int!) {
         kiosk: brands_locationKiosk_by_pk(id: $id) {
            accessPassword
            accessUrl
            id
            internalLocationKioskLabel
            isActive
            kioskModuleConfig
            locationId
            printerId
            orderTabs {
               orderPrefix
               posist_tabId
               posist_tabType
               orderTabId
               OrderTab {
                  label
               }
            }
         }
      }
   `,
   ORDER_TAB_LIST: gql`
      query OrderTabList {
         brands_orderTab(
            where: { availableOrderInterfaceLabel: { _eq: "Kiosk Ordering" } }
         ) {
            label
            id
         }
      }
   `,

   UPDATE_KIOSK: gql`
      mutation MyMutation2(
         $id: Int!
         $_set: brands_locationKiosk_set_input = {}
      ) {
         update_brands_locationKiosk_by_pk(
            pk_columns: { id: $id }
            _set: $_set
         ) {
            id
         }
      }
   `,

   CREATE_KIOSK_ORDER_TAB: gql`
      mutation MyMutation(
         $objects: [brands_locationKiosk_orderTab_insert_input!]!
      ) {
         insert_brands_locationKiosk_orderTab(objects: $objects) {
            affected_rows
         }
      }
   `,

   UPDATE_KIOSK_ORDER_TAB: gql`
      mutation MyMutation(
         $orderTabId: Int!
         $locationKioskId: Int!
         $_set: brands_locationKiosk_orderTab_set_input = {}
      ) {
         update_brands_locationKiosk_orderTab_by_pk(
            pk_columns: {
               locationKioskId: $locationKioskId
               orderTabId: $orderTabId
            }
            _set: $_set
         ) {
            locationKioskId
            orderPrefix
            orderTabId
            posist_tabId
            posist_tabType
         }
      }
   `,

   KIOSK_REPORT: gql`
      subscription kiosk_report {
         order_kioskReport {
            amount
            auth
            bankId
            cardNumber
            cardType
            city
            date
            dateTime
            id
            internalLocationKioskLabel
            isTest
            label
            locationId
            outlet
            locationKioskId
            par
            paymentStatus
            paymentType
            posist_sourceName
            posist_sourceOrderId
            posist_tabType
            terminalId
            time
            zipcode
         }
      }
   `,
}
