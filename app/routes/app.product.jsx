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
  const first = url.searchParams.get("first") || 5; // Giá trị mặc định là 5
  const after = url.searchParams.get("after") || null;

  const { admin, session } = await authenticate.admin(request);
  const products = await getAllProductWithPagination(
    admin.graphql,
    first,
    after,
  );
  return json({
    products,
  });
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
  const [currentPage, setCurrentPage] = useState(1);
  const [first, setFirst] = useState(5);
  const [active, setActive] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  console.log("🚀 ========= selectedId:", selectedId);

  const handleChange = useCallback(() => setActive(!active), [active]);
  const { products } = useLoaderData();

  const handlePagination = (newPage) => {
    const endCursor = products.products.pageInfo.endCursor;
    const url = new URL(window.location.href);
    url.searchParams.set("first", first);
    url.searchParams.set("after", endCursor);
    window.location.href = url.toString();
  };

  const resourceName = {
    singular: "product",
    plural: "product",
  };

  const listProduct = products.products.edges.map((product) => {
    return {
      id: product.node.id,
      title: product.node.title,
      price: product.node.variants.nodes,
      tags: product.node.tags,
    };
  });

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(listProduct);

  const rowMarkup = listProduct.map(({ id, title, price, tags }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {index}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{title}</IndexTable.Cell>
      <IndexTable.Cell>
        {price.map(
          (item, index) =>
            `${item.price}${index !== price.length - 1 ? ", " : ""}`,
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {tags.map(
          (tag, index) => `${tag}${index !== tags.length - 1 ? ", " : ""}`,
        )}
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
      <ui-title-bar title="Product">
        <button variant="primary"> Create New Product</button>
      </ui-title-bar>
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={products.products.edges.length}
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
          hasPrevious
          onPrevious={() => {
            handlePagination(currentPage - 1);
          }}
          hasNext
          onNext={() => {
            handlePagination(currentPage + 1);
          }}
        />
      </Card>
    </Page>
  );
}
