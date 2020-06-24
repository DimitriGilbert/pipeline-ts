import { CoreContainer } from "./CoreContainer";
import { Command } from ".";

let cli = new Command(CoreContainer)
cli.parseArgs(process.argv)
cli.process()