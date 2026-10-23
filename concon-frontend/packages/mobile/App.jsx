import { setStorageImpl } from "shared/utils/tokenStorage";
import { mobileStorage, hydrateStorage } from "./storage/mobileStorage";

setStorageImpl(mobileStorage);

export default function App() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        
    })
}