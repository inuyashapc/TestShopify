import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  Icon,
  IndexTable,
  Page,
  Pagination,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { addTag, getAllProductWithPagination } from "../models/product.server";
import { authenticate } from "../shopify.server";
import { EditIcon } from "@shopify/polaris-icons";
import ModalExample from "../components/modal";

export async function loader({ request }) {
  const url = new URL(request.url);
  const first = parseInt(url.searchParams.get("first") || "5", 10);
  const after = url.searchParams.get("after") || null;

  const { admin } = await authenticate.admin(request);
  const products = await getAllProductWithPagination(
    admin.graphql,
    first,
    after,
  );
  return json({ products });
}

export async function action({ request }) {
  const formData = await request.formData();
  const id = formData.get("id");
  const tag = formData.get("tag");

  const { admin } = await authenticate.admin(request); // Authenticate lại
  const result = await addTag(admin.graphql, id, tag);

  console.log("🚀 Tag Added:", result);

  return json({ success: true });
}

export default function ProductIndex() {
  const [active, setActive] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { products } = useLoaderData();

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
      window.location.href = url.toString();
    }
  };

  const handlePreviousPage = () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const currentAfter = params.get("after");

    if (currentAfter) {
      // Xóa param after để quay về trang trước
      params.delete("after");
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
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {index + 1}
        </Text>
      </IndexTable.Cell>
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

  return (
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
            { title: "ID" },
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
        />
        <Pagination
          hasPrevious={!!products.products.pageInfo.hasPreviousPage}
          onPrevious={handlePreviousPage}
          hasNext={!!products.products.pageInfo.hasNextPage}
          onNext={handleNextPage}
        />
      </Card>
    </Page>
  );
}
