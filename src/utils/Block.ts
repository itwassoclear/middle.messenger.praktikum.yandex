import { nanoid } from "nanoid";
import { EventBus } from "./EventBus";

export class Block {
  static EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_CDU: "flow:component-did-update",
    FLOW_RENDER: "flow:render",
  };

  public id = nanoid(6);
  protected props: Record<string, unknown>;
  protected children: Record<string, Block>;
  private eventBus: () => EventBus;
  private _element: HTMLElement | null = null;
  private _meta: { props: any };

  /** JSDoc
   * @param {string} tagName
   * @param {Object} props
   *
   * @returns {void}
   */

  constructor(propsWithChildren: any = {}) {
    const eventBus = new EventBus();

    const { props, children } = this._getChildrenAndProps(propsWithChildren);

    this._meta = {
      props,
    };

    this.children = children;

    this.initChildren();

    this.props = this._makePropsProxy(props);

    this.eventBus = () => eventBus;
    this._registerEvents(eventBus);

    eventBus.emit(Block.EVENTS.INIT);
  }

  private _getChildrenAndProps(childrenAndProps: any) {
    const props: Record<string, any> = {};
    const children: Record<string, Block> | Record<string, Block[]> = {};

    Object.entries(childrenAndProps).map(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else if (
        Array.isArray(value) &&
        value.every((v) => v instanceof Block)
      ) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    // Object.entries(childrenAndProps).forEach(([key, value]) => {
    //   if (value instanceof Array) {
    //     value.forEach((val) => {
    //       if (val instanceof Block) {
    //         children[key] = value;
    //       }
    //     });
    //   } else if (value instanceof Block) {
    //     children[key] = value;
    //   } else {
    //     props[key] = value;
    //   }
    // });

    return { props, children };
  }

  private _removeEvents() {
    const { events } = this.props;

    if (!events || !this._element) {
      return;
    }

    Object.entries(events).forEach(([event, listener]) => {
      this._element!.removeEventListener(event, listener);
    });
  }

  private _addEvents() {
    const { events = {} } = this.props as {
      events: Record<string, () => void>;
    };

    Object.keys(events).forEach((eventName) => {
      this._element?.addEventListener(eventName, events[eventName]);
    });
  }

  private _registerEvents(eventBus: EventBus) {
    eventBus.on(Block.EVENTS.INIT, this._init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _createResources() {
    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  private _init() {
    this._createResources();

    this.init();

    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  protected init() {}

  private _componentDidMount() {
    this.componentDidMount();
  }

  public componentDidMount() {}

  public dispatchComponentDidMount() {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(oldProps?: any, newProps?: any) {
    if (this.componentDidUpdate(oldProps, newProps)) {
      this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }

    // const response = this.componentDidUpdate(oldProps, newProps);
    // if (!response) {
    //   return;
    // }
    // this._render();
  }

  protected componentDidUpdate(oldProps: any, newProps: any) {
    return true;
  }

  public setProps = (nextProps: any) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  public get element() {
    return this._element;
  }

  private _render() {
    // const block = this.render();
    // this._removeEvents();
    // this._element!.innerHTML = "";
    // this._element!.append(block);
    // this._addEvents();

    const fragment = this.render();
    const newElement = fragment.firstElementChild as HTMLElement;

    if (this._element) {
      this._removeEvents();
      this._element.replaceWith(newElement);
    }

    this._element = newElement;
    this._addEvents();
  }

  protected render(): DocumentFragment {
    return new DocumentFragment();
  }

  protected compile(template: (context: any) => string, context: any) {
    // const fragment = this._createDocumentElement(
    //   "template"
    // ) as HTMLTemplateElement;

    // Object.entries(this.children).forEach(([name, component]) => {
    //   if (Array.isArray(component)) {
    //     context[name] = component.map((el) => `<div data-id='${el.id}'></div>`);
    //     return;
    //   }
    //     component.forEach((val) => {
    //       if (!contextAndStubs[name]) {
    //         contextAndStubs[name] = `<div data-id='${val.id}'></div>`;
    //       } else {
    //         contextAndStubs[
    //           name
    //         ] = `${contextAndStubs[name]}<div data-id='${val.id}'></div>`;
    //       }
    //     });
    //     return;
    //   }

    //   context[name] = `<div data-id='${component.id}'></div>`;
    // });

    // const htmlString = template(context);

    // fragment.innerHTML = htmlString;

    // Object.entries(this.children).forEach(([name, component]) => {
    //   if (Array.isArray(component)) {
    //     context[name] = component.map(el => `<div data-id='${el.id}'></div>`)
    //     return
    //   }
    //   const stub = fragment.content.querySelector(
    //     `[data-id='${component.id}']`
    //   );

    //   if (!stub) return;

    //   stub.replaceWith(component.getContent()!);
    // });

    // return fragment.content;

    const contextAndStubs = { ...context };

    Object.entries(this.children).forEach(([name, component]) => {
      if (Array.isArray(component)) {
        component.forEach((val) => {
          if (!contextAndStubs[name]) {
            contextAndStubs[name] = `<div data-id='${val.id}'></div>`;
          } else {
            contextAndStubs[
              name
            ] = `${contextAndStubs[name]}<div data-id='${val.id}'></div>`;
          }
        });
        return;
      }

      contextAndStubs[name] = `<div data-id='${component.id}'></div>`;
    });

    const html = template(contextAndStubs);

    const temp = document.createElement("template");

    temp.innerHTML = html;

    Object.entries(this.children).forEach(([_, component]) => {
      let stub;
      if (Array.isArray(component)) {
        component.forEach((val) => {
          stub = temp.content.querySelector(`[data-id='${val.id}']`);
          if (!stub) {
            return;
          }

          stub.replaceWith(val.getContent()!);
        });
      } else {
        stub = temp.content.querySelector(`[data-id='${component.id}']`);
        if (!stub) {
          return;
        }

        stub.replaceWith(component.getContent()!);
      }
    });

    return temp.content;
  }

  protected initChildren() {}

  public getContent() {
    return this.element;
  }

  private _makePropsProxy(props: any) {
    const self = this;

    return new Proxy(props, {
      get(target, prop) {
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target, prop, value) {
        const oldTarget = { ...target };
        target[prop] = value;

        self.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty() {
        throw new Error("Нет доступа");
      },
    });
  }

  private _createDocumentElement(tagName: string) {
    return document.createElement(tagName);
  }

  public show() {
    this.getContent()!.style.display = "block";
  }

  public hide() {
    this.getContent()!.style.display = "none";
  }
}