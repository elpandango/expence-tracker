import type {UiEvents} from "~/types/events";
import {Emitter} from "~/utils/emitter";

export const emitter = new Emitter<UiEvents>();