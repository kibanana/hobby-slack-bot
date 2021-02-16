export default interface IPayload {
  type: string,
  actions: [
    {
      name: string,
      type: string,
      selected_options: {
        '0': {
          value: string
        }
      }
    }
  ]
}