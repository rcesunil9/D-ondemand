import styled from 'styled-components'

export const TunnelBody = styled.div`
   padding: 32px;
   height: calc(100% - 106px);
   overflow: auto;
`

export const InputWrap = styled.div`
   margin-bottom: 32px;
`
export const Wrap = styled.div`
   padding: 16px;
`

export const SolidTile = styled.button`
   width: 70%;
   display: block;
   margin: 0 auto;
   border: 1px solid #cecece;
   padding: 10px 20px;
   border-radius: 2px;
   background-color: #fff;

   &:hover {
      background-color: #f3f3f3;
      cursor: pointer;
   }
`

export const StyledInputWrapper = styled.div`
   width: ${props => props.width}px;
   display: flex;
   align-items: center;
`

export const Grid = styled.div`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(${props => props.cols || 2}, 1fr);
`

export const Flex = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
`
export const InputWrapper = styled.div`
   padding: 16px 0;
   p .addFact {
      color: #00a7e1;
   }
`

export const StyledContainer = styled.div`
   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
   transition: 0.3s;
   width: 40%;
   margin: 16px 20em;
   padding: 16px;
   p {
      color: #00a7e1;
      &:hover {
         text-decoration: underline;
      }
   }
   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
   }
`

export const StyledRow = styled.div`
   margin-bottom: 16px;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
`

export const StyledAction = styled.div`
   position: absolute;
   right: 16px;
   top: 16px;
`
