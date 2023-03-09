import {
  MediaRenderer,
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useUnclaimedNFTSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import {
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import Image from "next/image";
import { useMemo, useEffect, useState } from "react";
import Timer from "../components/Timer";
import styles from "../styles/Theme.module.css";
import { parseIneligibility } from "../utils/parseIneligibility";
import fotfLogo from './fotf.png';
import LaunchIcon from '@mui/icons-material/Launch';

// Put Your NFT Drop Contract address from the dashboard here
const myNftDropContractAddress = "0x6E3D19341E0d655f3bD67f2a4B5D49763252940f";

const Home: NextPage = () => {
  const { contract: nftDrop } = useContract(myNftDropContractAddress);

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if(isMobile){
      return;
    } 
  }, [isMobile]);

  const address = useAddress();
  const [quantity, setQuantity] = useState(1);

  const { data: contractMetadata } = useContractMetadata(nftDrop);

  const claimConditions = useClaimConditions(nftDrop);

  const activeClaimCondition = useActiveClaimConditionForWallet(
    nftDrop,
    address || ""
  );
  const claimerProofs = useClaimerProofs(nftDrop, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(nftDrop, {
    quantity,
    walletAddress: address || "",
  });
  const unclaimedSupply = useUnclaimedNFTSupply(nftDrop);
  const claimedSupply = useClaimedNFTSupply(nftDrop);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0)
      .add(BigNumber.from(unclaimedSupply.data || 0))
      .toString();
  }, [claimedSupply.data, unclaimedSupply.data]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable;

    if (snapshotClaimable) {
      if (snapshotClaimable === "0") {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000);
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable);
        } catch (e) {
          // fall back to default case
        }
      }
    }

    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);

    let max;
    if (maxAvailable.lt(bnMaxClaimable)) {
      max = maxAvailable;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    claimerProofs.data?.maxClaimable,
    unclaimedSupply.data,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      unclaimedSupply.isLoading ||
      claimedSupply.isLoading ||
      !nftDrop
    );
  }, [
    activeClaimCondition.isLoading,
    nftDrop,
    claimedSupply.isLoading,
    unclaimedSupply.isLoading,
  ]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  );
  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      if (pricePerToken.eq(0)) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Claiming not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);

  const openStore = () => {
    window.open("https://app.furyofthefur.com/store");
  }

  return (
    <div className={styles.container}>
      <div className={styles.mintInfoContainer}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.infoSide}>
            <div style={{ width: "100%", height: "200px", position: "relative", textAlign:"center"}} >
              <Image src={fotfLogo.src} width={300} height={150} className={styles.fotf} alt={"FOTF Logo"} />
            </div>
               {/* Title of your NFT Collection */}
              <h1 className={styles.name}>AI Ted Mint <br></br> Cost: 100,000 $HNY</h1>
              {/* Description of your NFT Collection */}
              <p className={styles.description}>
              Fully generated recreation of the Original 9671 Fury Teds from Fury Of The Fur.<br></br>
              <br></br>Artwork created by a community member using Starry AI. <br></br>
              <br></br>No Utility. Just Art and Testing.

              </p>
            </div>
           
            <div className={isMobile? styles.imageSideMobile : styles.imageSide}>
            <div className={styles.column}>

              
              <button onClick={() => openStore()} className={styles.buyHNYButton}>
                Buy $HNY 
                </button>
              {/* Image Preview of NFTs */}
              <MediaRenderer
                className={styles.image}
                src={contractMetadata?.image}
                alt={`${contractMetadata?.name} preview image`}
              />

              {/* Amount claimed so far */}
              <div className={styles.mintCompletionArea}>
                <div className={styles.mintAreaLeft}>
                  <p>Total Minted</p>
                </div>
                <div className={styles.mintAreaRight}>
                  {claimedSupply && unclaimedSupply ? (
                    <p>
                      <b>{numberClaimed}</b>
                      {" / "}
                      {numberTotal}
                    </p>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>

              {claimConditions.data?.length === 0 ||
              claimConditions.data?.every(
                (cc) => cc.maxClaimableSupply === "0"
              ) ? (
                <div>
                  <h2>
                    This drop is not ready to be minted yet. (No claim condition
                    set)
                  </h2>
                </div>
              ) : !activeClaimCondition.data && claimConditions.data ? (
                <div>
                  <h2>Drop starts in:</h2>
                  <Timer date={claimConditions.data[0].startTime} />
                </div>
              ) : (
                <>
                  <p>Quantity</p>
                  <div className={styles.quantityContainer}>
                    <button
                      className={`${styles.quantityControlButton}`}
                      onClick={() => setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>

                    <h4>{quantity}</h4>

                    <button
                      className={`${styles.quantityControlButton}`}
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= maxClaimable}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.mintContainer}>
                    {isSoldOut ? (
                      <div>
                        <h2>Sold Out</h2>
                      </div>
                    ) : (
                      <Web3Button
                        contractAddress={nftDrop?.getAddress() || ""}
                        action={(cntr) => cntr.erc721.claim(quantity)}
                        isDisabled={!canClaim || buttonLoading}
                        onError={(err) => {
                          console.error(err);
                          alert("Error claiming NFTs");
                        }}
                        onSuccess={() => {
                          setQuantity(1);
                          alert("Successfully claimed NFTs");
                        }}
                      >
                        {buttonLoading ? "Loading..." : buttonText}
                      </Web3Button>
                    )}
                    
                  </div>
                  
                </>
              )}
            </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.row}>
      Powered by         
      <Image
        src="/logo.png"
        alt="thirdweb Logo"
        width={135}
        height={22}
        className={styles.buttonGapTop}
        style={{
          objectFit: "contain",
        }}
      />
      </div>
      
    </div>
  );
};

export default Home;
