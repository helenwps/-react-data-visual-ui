import { createSelector } from 'reselect'

const selectGlobal = (state) => state.register

const makeSelectSignupLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.signupLoading
)

const makeSelectSignupExtraLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.signupExtraLoading
)

export {
  makeSelectSignupLoading,
  makeSelectSignupExtraLoading
}
