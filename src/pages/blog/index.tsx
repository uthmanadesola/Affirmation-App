import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { createTree } from "../../router";
import article from "./article";


export default (parent: AnyRoute) => {
  const rootRoute = createRoute({
    path: '/blog',
    getParentRoute: () => parent,
  })

  return createTree(rootRoute,
    article,
  )
}