import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Button,
  Card,
  Frame,
  Icon,
  IndexTable,
  Page,
  Pagination,
  useIndexResourceState,
} from "@shopify/polaris";
import { EditIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import ModalExample from "../../components/modal";
import {
  addTag,
  getAllProductWithPagination,
} from "../../models/product.server";
import { authenticate } from "../../shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const after = url.searchParams.get("after") || null;
  const before = url.searchParams.get("before") || null;

  let first = null;
  let last = null;

  if (before) {
    last = parseInt(url.searchParams.get("last") || "5", 10);
  } else {
    first = parseInt(url.searchParams.get("first") || "5", 10);
  }

  const { admin } = await authenticate.admin(request);
  const products = await getAllProductWithPagination(admin.graphql, {
    first,
    after,
    before,
    last,
  });

  return json({ products });
}

export async function action({ request }) {
  const formData = await request.formData();
  const id = formData.get("id");
  const tag = formData.get("tag");

  const { admin } = await authenticate.admin(request); // Authenticate lại

  await addTag(admin.graphql, id, tag);

  return json({ success: true });
}

export default function ProductIndex() {
  const [active, setActive] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { products } = useLoaderData();
  const fetcher = useFetcher();
  const shouldReload = useRef(false);
  useEffect(() => {
    console.log("check", fetcher.state);
    if (fetcher.state === "submitting") {
      shouldReload.current = true;
    }
    if (fetcher.state === "idle" && shouldReload.current) {
      shouldReload.current = false;
      fetcher.load("/app/product");
    }
    // console.log("tét fetcher", fetcher.state, fetcher.data);
    // if (fetcher.state === "idle" && fetcher.data) {
    //   fetcher.load("/app/product"); // loader lấy dữ liệu mới
    // }
  }, [fetcher.state]);

  const handleChange = useCallback(() => setActive(!active), [active]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(
      products.products.edges.map((product) => ({
        id: product.node.id,
        title: product.node.title,
      })),
    );

  const listProduct = products.products.edges.map((product) => ({
    id: product.node.id,
    title: product.node.title,
    price: product.node.variants.nodes,
    tags: product.node.tags,
  }));

  const handleNextPage = () => {
    if (products.products.pageInfo.hasNextPage) {
      const endCursor = products.products.pageInfo.endCursor;
      const url = new URL(window.location.href);
      url.searchParams.set("after", endCursor);
      url.searchParams.delete("before");
      url.searchParams.set("first", "5");
      url.searchParams.delete("last");
      window.location.href = url.toString();
    }
  };

  const handlePreviousPage = () => {
    if (products.products.pageInfo.hasPreviousPage) {
      const startCursor = products.products.pageInfo.startCursor;
      const url = new URL(window.location.href);
      url.searchParams.set("before", startCursor);
      url.searchParams.delete("after");
      url.searchParams.set("last", "5");
      url.searchParams.delete("first");
      window.location.href = url.toString();
    }
  };

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const rowMarkup = listProduct.map(({ id, title, price, tags }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>{title}</IndexTable.Cell>
      <IndexTable.Cell>
        {price.map((item, idx) => (
          <span key={idx}>
            {item.price}
            {idx !== price.length - 1 ? ", " : ""}
          </span>
        ))}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {tags.map((tag, idx) => (
          <span key={idx}>
            {tag}
            {idx !== tags.length - 1 ? ", " : ""}
          </span>
        ))}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(id);
            handleChange();
          }}
        >
          <Icon source={EditIcon} tone="base" />
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  console.log(
    "ABC: ",
    fetcher.state == "submitting" || fetcher.state == "loading",
  );
  return (
    <Frame>
      <Page fullWidth>
        <Card>
          <IndexTable
            resourceName={resourceName}
            itemCount={listProduct.length}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Title" },
              { title: "Price" },
              { title: "Tags" },
              { title: "Actions" },
            ]}
          >
            {rowMarkup}
          </IndexTable>
          <ModalExample
            active={active}
            handleChange={handleChange}
            id={selectedId}
            fetcher={fetcher}
          />
          <Pagination
            hasPrevious={!!products.products.pageInfo.hasPreviousPage}
            onPrevious={handlePreviousPage}
            hasNext={!!products.products.pageInfo.hasNextPage}
            onNext={handleNextPage}
          />
        </Card>
      </Page>
    </Frame>
  );
}
