import { setStorageImpl } from "shared/utils/tokenStorage";
import { webStorage } from "./storage/webStorage";

setStorageImpl(webStorage);