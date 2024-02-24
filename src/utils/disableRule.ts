import t from '@babel/types'

type CommentsType = Array<t.CommentBlock | t.CommentLine>
export class DisableRule {
  nextLine: number[] = []
  thisLine: number[] = []
  entireFileDisabled = false

  constructor(comments: CommentsType) {
    if (comments.some((item) => /i18n-disable-file/.test(item.value))) {
      this.entireFileDisabled = true
    } else {
      comments.forEach((item) => {
        if (/i18n-disable-next/.test(item.value)) {
          this.nextLine.push(item.loc!.end.line)
        } else if (/i18n-disable/.test(item.value)) {
          this.thisLine.push(item.loc!.start.line)
        }
      })
    }
  }

  test(sourceLocation: t.SourceLocation | undefined | null) {
    if (!sourceLocation) return false
    let line = sourceLocation.start.line
    let res = false
    this.nextLine.forEach((item) => item + 1 == line && (res = true))
    if (this.thisLine.includes(line)) res = true
    return res
  }
}
