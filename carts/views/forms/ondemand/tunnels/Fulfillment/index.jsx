import React from 'react'
import {
   TunnelHeader,
   Flex,
   OptionTile,
   Spacer,
   Tunnels,
   Tunnel,
   Text,
   RadioGroup,
   ButtonTile,
   IconButton,
   Form,
} from '@dailykit/ui'
import styled from 'styled-components'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { useManual } from '../../state'
import {
   generateDeliverySlots,
   generateMiniSlots,
   generatePickUpSlots,
   generateTimeStamp,
   getDistance,
   isDeliveryAvailable,
   isPickUpAvailable,
} from './utils'
import { useParams } from 'react-router'
import { EditIcon } from '../../../../../../../shared/assets/icons'
import { InlineLoader } from '../../../../../../../shared/components'
import { logger, parseAddress } from '../../../../../../../shared/utils'
import { toast } from 'react-toastify'

export const FulfillmentTunnel = ({ panel }) => {
   const [tunnels] = panel
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="md">
            <Content panel={panel} />
         </Tunnel>
      </Tunnels>
   )
}

const Content = ({ panel }) => {
   const [, , closeTunnel] = panel
   const { brand, address, tunnels } = useManual()
   const { id: cartId } = useParams()

   const [distance, setDistance] = React.useState(null)
   const [type, setType] = React.useState('')
   const [time, setTime] = React.useState('')
   const [error, setError] = React.useState('')
   const [typeOptions, setTypeOptions] = React.useState([])
   const [pickerDates, setPickerDates] = React.useState([])
   const [pickerSlots, setPickerSlots] = React.useState([])
   const [fulfillment, setFulfillment] = React.useState({})

   const storedDistance = React.useRef()

   React.useEffect(() => {
      if (brand?.brand_brandSettings?.length) {
         const types = []

         const deliverySetting = brand.brand_brandSettings.find(
            setting =>
               setting.brandSetting.identifier === 'Delivery Availability'
         )
         const { value: deliveryAvailability } = deliverySetting

         if (deliveryAvailability?.isAvailable)
            types.push({ id: 'DELIVERY', title: 'Delivery' })

         const pickupSetting = brand.brand_brandSettings.find(
            setting => setting.brandSetting.identifier === 'Pickup Availability'
         )
         const { value: pickupAvailability } = pickupSetting

         if (pickupAvailability?.isAvailable)
            types.push({ id: 'PICKUP', title: 'Pickup' })

         setTypeOptions(types)
      }
   }, [brand?.brand_brandSettings?.length])

   // Mutation
   const [updateCart, { loading }] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully updated fulfillment details.')
         closeTunnel(1)
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the fulfillment details.')
      },
   })

   // Subscriptions
   const { data: { preOrderPickup = [] } = {}, loading: PPLoading } =
      useSubscription(QUERIES.FULFILLMENT.PREORDER.PICKUP, {
         variables: {
            brandId: brand?.id,
         },
      })

   const { data: { onDemandPickup = [] } = {}, loading: OPLoading } =
      useSubscription(QUERIES.FULFILLMENT.ONDEMAND.PICKUP, {
         variables: {
            brandId: brand?.id,
         },
      })

   const { data: { preOrderDelivery = [] } = {}, loading: PDLoading } =
      useSubscription(QUERIES.FULFILLMENT.PREORDER.DELIVERY, {
         skip: distance === null,
         variables: {
            distance,
            brandId: brand?.id,
         },
      })

   const { data: { onDemandDelivery = [] } = {}, loading: ODLoading } =
      useSubscription(QUERIES.FULFILLMENT.ONDEMAND.DELIVERY, {
         skip: distance === null,
         variables: {
            distance,
            brandId: brand?.id,
         },
      })

   React.useEffect(() => {
      setTime('')
      setError('')

      if (brand.brand_brandSettings.length) {
         const addressSetting = brand.brand_brandSettings.find(
            setting => setting.brandSetting.identifier === 'Location'
         )
         const { value: storeAddress } = addressSetting

         ;(async () => {
            if (
               address?.lat &&
               address?.lng &&
               storeAddress?.lat &&
               storeAddress?.lng
            ) {
               const distance = await getDistance(
                  +address.lat,
                  +address.lng,
                  +storeAddress.lat,
                  +storeAddress.lng
               )
               console.log({ distance })
               storedDistance.current = distance
               setDistance(distance.drivable || distance.aerial)
            }
         })()
      }
   }, [address?.id, brand])

   React.useEffect(() => {
      if (fulfillment.date && time === 'PREORDER') {
         const index = pickerDates.findIndex(
            data => data.value === fulfillment.date
         )
         setPickerSlots([...pickerDates[index].slots])
         setFulfillment({
            ...fulfillment,
            slot: pickerDates[index].slots[0],
         })
      }
   }, [fulfillment.date])

   React.useEffect(() => {
      if (fulfillment.time && time === 'PREORDER') {
         const index = pickerSlots.findIndex(
            slot => slot.value === fulfillment.time
         )
         setFulfillment({
            ...fulfillment,
            slot: pickerSlots[index],
         })
      }
   }, [fulfillment.time])

   React.useEffect(() => {
      try {
         if (time && type) {
            setError('')

            if (brand.brand_brandSettings.length) {
               const deliverySetting = brand.brand_brandSettings.find(
                  setting =>
                     setting.brandSetting.identifier === 'Delivery Availability'
               )
               const { value: deliveryAvailability } = deliverySetting
               console.log('🚀 deliveryAvailability', deliveryAvailability)

               const pickupSetting = brand.brand_brandSettings.find(
                  setting =>
                     setting.brandSetting.identifier === 'Pickup Availability'
               )
               const { value: pickupAvailability } = pickupSetting
               console.log('🚀 pickupAvailability', pickupAvailability)

               switch (type) {
                  case 'PICKUP': {
                     if (pickupAvailability?.isAvailable) {
                        switch (time) {
                           case 'ONDEMAND': {
                              if (onDemandPickup[0]?.recurrences?.length) {
                                 const result = isPickUpAvailable(
                                    onDemandPickup[0].recurrences
                                 )
                                 if (result.status) {
                                    const date = new Date()
                                    setFulfillment({
                                       date: date.toDateString(),
                                       slot: {
                                          time:
                                             date.getHours() +
                                             ':' +
                                             date.getMinutes(),
                                       },
                                    })
                                 } else {
                                    setError(
                                       'Sorry! Option not available currently!'
                                    )
                                 }
                              } else {
                                 setError(
                                    'Sorry! Option not available currently.'
                                 )
                              }
                              break
                           }
                           case 'PREORDER': {
                              if (preOrderPickup[0]?.recurrences?.length) {
                                 const result = generatePickUpSlots(
                                    preOrderPickup[0].recurrences
                                 )
                                 if (result.status) {
                                    const miniSlots = generateMiniSlots(
                                       result.data,
                                       15
                                    )
                                    if (miniSlots.length) {
                                       setPickerDates([...miniSlots])
                                       setFulfillment({
                                          date: miniSlots[0].date,
                                          slot: {
                                             time: miniSlots[0].slots[0].time,
                                          },
                                       })
                                    } else {
                                       setError(
                                          'Sorry! No time slots available.'
                                       )
                                    }
                                 } else {
                                    setError('Sorry! No time slots available.')
                                 }
                              } else {
                                 setError('Sorry! No time slots available.')
                              }
                              break
                           }
                           default: {
                              return setError('Unknown error!')
                           }
                        }
                     } else {
                        setError('Sorry! Pickup not available currently.')
                     }
                     break
                  }
                  case 'DELIVERY': {
                     if (!distance) {
                        return setError('Please add an address first!')
                     }
                     if (deliveryAvailability?.isAvailable) {
                        switch (time) {
                           case 'ONDEMAND': {
                              if (onDemandDelivery[0]?.recurrences?.length) {
                                 const result = isDeliveryAvailable(
                                    onDemandDelivery[0].recurrences
                                 )
                                 if (result.status) {
                                    const date = new Date()
                                    setFulfillment({
                                       distance,
                                       date: date.toDateString(),
                                       slot: {
                                          time:
                                             date.getHours() +
                                             ':' +
                                             date.getMinutes(),
                                          mileRangeId: result.mileRangeId,
                                       },
                                    })
                                 } else {
                                    setError(
                                       result.message ||
                                          'Sorry! Delivery not available at the moment.'
                                    )
                                 }
                              } else {
                                 setError(
                                    'Sorry! Option not available currently.'
                                 )
                              }
                              break
                           }
                           case 'PREORDER': {
                              if (preOrderDelivery[0]?.recurrences?.length) {
                                 const result = generateDeliverySlots(
                                    preOrderDelivery[0].recurrences
                                 )
                                 if (result.status) {
                                    const miniSlots = generateMiniSlots(
                                       result.data,
                                       15
                                    )
                                    console.log(miniSlots)
                                    if (miniSlots.length) {
                                       setPickerDates([...miniSlots])
                                       setFulfillment({
                                          distance,
                                          date: miniSlots[0].date,
                                          slot: {
                                             time: miniSlots[0].slots[0].time,
                                             mileRangeId:
                                                miniSlots[0].slots[0]
                                                   ?.mileRangeId,
                                          },
                                       })
                                    } else {
                                       setError(
                                          'Sorry! No time slots available.'
                                       )
                                    }
                                 } else {
                                    setError(
                                       result.message ||
                                          'Sorry! No time slots available for selected options.'
                                    )
                                 }
                              } else {
                                 setError('Sorry! No time slots available.')
                              }
                              break
                           }
                           default: {
                              return setError('Unknown error!')
                           }
                        }
                     } else {
                        setError('Sorry! Delivery not available currently.')
                     }
                     break
                  }
                  default: {
                     return setError('Unknown error!')
                  }
               }
            }
         }
      } catch (error) {
         console.log(error)
      }
   }, [type, time, distance])

   const save = () => {
      try {
         const fulfillmentInfo = {
            type: time + '_' + type,
            distance: storedDistance.current,
            slot: {
               mileRangeId: fulfillment.slot?.mileRangeId || null,
               ...generateTimeStamp(fulfillment.slot.time, fulfillment.date),
            },
         }
         console.log(fulfillmentInfo)
         updateCart({
            variables: {
               id: cartId,
               _set: {
                  fulfillmentInfo,
               },
            },
         })
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <>
         <TunnelHeader
            title="Fulfillment Details"
            close={() => closeTunnel(1)}
            right={{
               title: 'Save',
               disabled: error || !type || !time,
               isLoading: loading,
               action: save,
            }}
         />
         {[PPLoading, OPLoading, PDLoading, ODLoading].some(Boolean) ? (
            <InlineLoader />
         ) : (
            <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
               <Text as="text1"> Order for </Text>
               <Spacer size="4px" />
               <RadioGroup
                  options={typeOptions}
                  onChange={option => {
                     setType(option?.id ?? '')
                     setPickerDates([])
                     setPickerSlots([])
                  }}
               />
               <Spacer size="16px" />
               {type === 'DELIVERY' && (
                  <>
                     <Text as="text1"> Address for Delivery </Text>
                     <Spacer size="4px" />
                     {Boolean(address?.id) ? (
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-between"
                        >
                           <Text as="text2">{parseAddress(address)}</Text>
                           <IconButton
                              type="outline"
                              size="sm"
                              onClick={() => tunnels.address[1](1)}
                           >
                              <EditIcon />
                           </IconButton>
                        </Flex>
                     ) : (
                        <ButtonTile
                           type="secondary"
                           text="Add Address"
                           onClick={() => tunnels.address[1](1)}
                        />
                     )}
                     <Spacer size="16px" />
                  </>
               )}
               {Boolean(type) && (
                  <>
                     <Text as="text1"> When would you like your order? </Text>
                     <Spacer size="4px" />
                     <RadioGroup
                        options={[
                           { id: 'ONDEMAND', title: 'Now' },
                           { id: 'PREORDER', title: 'Later' },
                        ]}
                        onChange={option => setTime(option?.id ?? '')}
                     />
                     <Spacer size="16px" />
                  </>
               )}
               {time === 'PREORDER' && Boolean(pickerDates.length) && (
                  <>
                     <Text as="text1"> Select a slot </Text>
                     <Spacer size="4px" />
                     <Flex container alignItems="center">
                        <Form.Group>
                           <Form.Label htmlFor="date" title="date">
                              Date
                           </Form.Label>
                           <Form.Select
                              id="date"
                              name="date"
                              options={pickerDates}
                              onChange={e =>
                                 setFulfillment({ date: e.target.value })
                              }
                              placeholder="Choose a date"
                           />
                        </Form.Group>
                        <Spacer size="16px" xAxis />
                        <Form.Group>
                           <Form.Label htmlFor="time" title="time">
                              Time
                           </Form.Label>
                           <Form.Select
                              id="time"
                              name="time"
                              options={pickerSlots}
                              onChange={e =>
                                 setFulfillment({
                                    ...fulfillment,
                                    time: e.target.value,
                                 })
                              }
                              placeholder="Choose a time slot"
                           />
                        </Form.Group>
                     </Flex>
                  </>
               )}
               {Boolean(error) && <Styles.Error>{error}</Styles.Error>}
            </Flex>
         )}
      </>
   )
}

const Styles = {
   Error: styled.small`
      color: #ec3333;
   `,
}
