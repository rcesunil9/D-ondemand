import React, { useState, useContext } from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRAND_LISTING } from '../../graphql'
import { logger } from '../../../../shared/utils'
import { InlineLoader } from '../../../../shared/components'
import BrandContext from '../../context/Brand'
// Styled
import { StyledList, StyledListItem, StyledHeading } from './styled'
export default function BrandListing() {
   const [context, setContext] = useContext(BrandContext)
   const [brandList, setBrandList] = useState([])
   const [viewingFor, setViewingFor] = useState('')
   const { loading, error } = useSubscription(BRAND_LISTING, {
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.brands
         setBrandList(result)
         result.map(brand => {
            if (brand.isDefault) {
               setViewingFor(brand.id)
               setContext({
                  brandId: brand.id,
                  brandName: brand.title,
                  domain: brand.domain,
               })
            }
         })
      },
   })

   const brandHandler = brand => {
      toast.info(`Showing information for "${brand.title}" brand`)
      setViewingFor(brand.id)
      setContext({
         brandId: brand.id,
         brandName: brand.title,
         domain: brand.domain,
      })
   }

   if (error) {
      toast.error('Something went wrong!!')
      logger(error)
   }
   if (loading) return <InlineLoader />
   return (
      <div>
         <StyledHeading>Viewing For</StyledHeading>
         <StyledList>
            {brandList.map(brand => {
               return (
                  <StyledListItem
                     key={brand.id}
                     default={brand.id === viewingFor}
                     onClick={() => brandHandler(brand)}
                  >
                     {brand.title}
                  </StyledListItem>
               )
            })}
         </StyledList>
      </div>
   )
}
