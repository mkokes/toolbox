import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

/** Open the antd Select labelled `label` and pick the option whose text is `option`. */
export async function choose(user: UserEvent, label: string | RegExp, option: string) {
  await user.click(screen.getByLabelText(label))
  // antd renders each option with a `title`; the open dropdown is the last match.
  const matches = await screen.findAllByTitle(option)
  await user.click(matches.at(-1)!)
}
