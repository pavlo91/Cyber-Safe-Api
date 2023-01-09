import { Job } from '.'

export class SampleJob implements Job {
  constructor(public name: string, public expression: string) {}

  execute() {
    console.log('Sample')
  }
}
