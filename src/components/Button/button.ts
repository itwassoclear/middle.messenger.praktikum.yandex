import { Block } from "../../utils/Block";
import template from "./button.hbs";
import "./button.less";

interface IButton {
  label?: string;
  className?: string;
  type?: string;
  events?: {
    click: (e: Event) => void;
  };
}

export class Button extends Block {
  constructor(props: IButton) {
    super(props);
  }

  render() {
    return this.compile(template, { ...this.props });
  }
}
